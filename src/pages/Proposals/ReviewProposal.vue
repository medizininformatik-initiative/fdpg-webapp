<template>
  <section class="review-proposal">
    <LeadHeader />
    <template v-for="(section, sIdx) in getVisibleSections(sections)" :key="'section' + sIdx">
      <ReviewAreaLabel
        headline="h2"
        :title="section.sectionLabel"
        :hide-review-checkbox="HideReviewCheckbox(section)"
        :number="`${sIdx + 1}`"
        v-if="section.key == 'participants'"
      />
      <template v-if="section.kind === 'array' && proposalData">
        <div
          v-for="(sectionItem, sectionItemIdx) in getVisibleItems(proposalData[section.key], section)"
          :key="'item' + sectionItemIdx"
        >
          <section role="region" class="print-region">
            <ReviewAreaLabel
              :section-values="getSectionArrayProposalData(section, 'isDone', sectionItem)"
              :section-ids="getSectionArrayProposalData(section, '_id', sectionItem)"
              headline="h3"
              :title="getArrayLabelFromSection(section, sectionItem)"
              :number="`${sIdx + 1}.${sectionItemIdx + 1}`"
            />

            <template v-for="(card, cardIdx) in getVisibleCards(section.mapping, sectionItem)" :key="'card' + cardIdx">
              <ReviewCard
                :dto="sectionItem"
                :card="card"
                headline="h4"
                :is-draft="proposalStore.currentProposal?.status === ProposalStatus.Draft"
                hide-review-checkbox
                :number="`${sIdx + 1}.${sectionItemIdx + 1}.${cardIdx + 1}`"
                :possible-locations="possibleLocations"
              ></ReviewCard>
            </template>
          </section>
        </div>
      </template>

      <section v-else-if="section.kind === 'single' && proposalData" role="region" class="print-region">
        <ReviewCard
          :dto="proposalData"
          :card="section.card"
          :headline="section.card.cardLabel === null ? 'h2' : 'h3'"
          :headline-overwrite="section.sectionLabel"
          :is-draft="proposalStore.currentProposal?.status === ProposalStatus.Draft"
          :number="`${sIdx + 1}`"
          :possible-locations="possibleLocations"
        ></ReviewCard>
      </section>

      <template v-else-if="section.kind === 'object' && proposalData">
        <ReviewAreaLabel
          :hide-review-checkbox="HideReviewCheckbox(section)"
          class="form-label-mt-4"
          :section-values="getSectionObjectProposalData(section, 'isDone', proposalData)"
          :section-ids="getSectionObjectProposalData(section, '_id', proposalData)"
          headline="h2"
          :title="t(section.sectionLabel)"
          :number="`${sIdx + 1}`"
        />

        <section
          v-for="(card, cardIdx) in getVisibleCards(section.mapping, proposalData[section.key])"
          :key="'objectCard' + cardIdx"
          role="region"
          class="print-region"
        >
          <ReviewCard
            :dto="proposalData[section.key]"
            :card="card"
            :is-draft="proposalStore.currentProposal?.status === ProposalStatus.Draft"
            :hide-review-checkbox="isSinglePersonEntry(section)"
            :number="`${sIdx + 1}.${cardIdx + 1}`"
            :possible-locations="possibleLocations"
          ></ReviewCard>
        </section>
      </template>
    </template>

    <ReviewLabel
      class="form-label-mt-4"
      title="proposal.appendix"
      headline="h2"
      :counter="uploadsForType.length"
      :number="`${getVisibleSections(sections).length + 1}`"
    />
    <DocumentList
      :documents="uploadsForType"
      :proposal-id="proposalId"
      :is-loading="false"
      :is-disabled="true"
      :two-columns="true"
      empty-alert-text="proposal.noAttachmentsYet"
    />

    <OrphanedTaskViewer />
  </section>
</template>

<script setup lang="ts">
import DocumentList from '@/components/Proposals/Details/DocumentList.vue'
import ReviewLabel from '@/components/ReviewLabel.vue'
import ReviewAreaLabel from '@/components/ReviewAreaLabel.vue'
import OrphanedTaskViewer from '@/components/TaskViewer/OrphanedTaskViewer.vue'
import type {
  DefinitionSection,
  IDefinitionSectionArray,
  IDefinitionSectionObject,
} from '@/components/Shared/definition-card.types'
import useUpload from '@/composables/use-upload'
import { participantSection } from '@/constants/print-structure/participant-section'
import { requestedDataSection } from '@/constants/print-structure/requested-data-section'
import { userProjectSection } from '@/constants/print-structure/user-project-section'
import ReviewCard from '@/pages/Proposals/ParticipatingScientists/ReviewCard.vue'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IProposal } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { transformForm } from '@/utils/form-transform'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { ElButton } from 'element-plus'
import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { applicantSection } from '@/constants/print-structure/applicant-section'
import { projectResponsibilitySection } from '@/constants/print-structure/project-responsibility-section'
import { projectUserSection } from '@/constants/print-structure/project-user-section'
import useNotifications from '@/composables/use-notifications'
import { ProposalStatus, ProposalTypeOfUse } from '@/types/proposal.types'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useI18n } from 'vue-i18n'
import { biosampleSection } from '@/constants/print-structure/biosample-section'
import LeadHeader from '@/components/Shared/LeadHeader.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation, ILocationKeyLabel } from '@/types/location.types'

const authStore = useAuthStore()

const sections = computed(
  () =>
    [
      applicantSection(locationMapRef.value),
      projectResponsibilitySection(locationMapRef.value),
      projectUserSection,
      participantSection(locationMapRef.value),
      userProjectSection(authStore.assignedDataSources, locationMapRef.value),
      requestedDataSection,
      biosampleSection(authStore.assignedDataSources),
    ] as DefinitionSection<IProposal, keyof IProposal>[],
)

const proposalData = ref<IProposal>()

const layoutStore = useLayoutStore()
const router = useRouter()
const { params, query } = useRoute()
const proposalId = computed(() => params.id as string)
const proposalStore = useProposalStore()
const commentStore = useCommentStore()

const locationStore = useLocationStore()

const locationMapRef: Ref<Record<string, ILocationKeyLabel>> = ref({})

const possibleLocations = computed(() =>
  (proposalStore?.currentProposal?.userProject?.addressees?.desiredLocations ?? [])
    .map((locId) => locationMapRef.value?.[locId])
    .filter((loc) => loc),
)

const { uploadsForType } = useUpload(proposalId, [
  DirectUpload.GeneralAppendix,
  DirectUpload.EthicVote,
  DirectUpload.EthicVoteDeclarationOfNonResponsibility,
  UseCaseUpload.ProposalPDF,
])

const { showErrorMessage } = useNotifications()

const { t } = useI18n()

const fetchProposal = async () => {
  try {
    const data = await proposalStore.setCurrentProposal(params.id as string)
    proposalData.value = transformForm(data) as IProposal

    const lastDashboard = layoutStore.lastDashboard
    layoutStore.setBreadcrumbs([
      {
        name: lastDashboard,
        displayName: getLastDashboardTitle(lastDashboard),
      },
      {
        name: RouteName.ProposalDetails,
        params: data._id ? { id: data._id } : undefined,
        displayName: data.projectAbbreviation,
      },
    ])
  } catch (error) {
    showErrorMessage()
    router.push({ name: RouteName.Dashboard })
    console.log(error)
  }
}

const fetchComments = async () => {
  try {
    await commentStore.fetchAll({ proposalId: proposalId.value })
  } catch (error) {
    showErrorMessage()
    console.log(error)
  }
}
const scrollToAnchor = async () => {
  if (query.anchor) {
    await nextTick()
    const element = document.getElementById(query.anchor as string)
    if (element) {
      element.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }
}

const shouldHideReviewCard = (dto: any, hideIfOtherValueIsTruthy?: string[]) => {
  if (!hideIfOtherValueIsTruthy || hideIfOtherValueIsTruthy.length === 0) {
    return false
  }

  let value = dto
  for (const key of hideIfOtherValueIsTruthy) {
    if (value === undefined || value === null) {
      return false
    }
    value = value[key]
  }

  if (Array.isArray(value)) {
    return value.length > 0
  } else {
    return !!value
  }
}

const getArrayLabelFromSection = (
  section: Partial<IDefinitionSectionArray<IProposal, keyof IProposal, never>>,
  sectionItem: any,
) => {
  const arrayLabel = section.arrayLabel
  const arrayLabelKey = section.arrayLabelKey

  if (!arrayLabel || !arrayLabelKey) {
    return ''
  }

  return arrayLabel
    .map((labelKey) => (sectionItem[arrayLabelKey][labelKey.key] ?? labelKey.key) as string)
    .reduce((prev, curr) => prev + ' ' + curr)
}

const getSectionObjectProposalData = (
  section: IDefinitionSectionObject<IProposal, keyof IProposal>,
  property: string,
  proposalData?: IProposal,
) =>
  getVisibleCards(section.mapping, proposalData?.[section.key])
    .map((mapping: any) => (proposalData?.[section.key] as any)?.[mapping.key])
    .map((data: any) => (data ? data[property] : undefined))

const getSectionArrayProposalData = (
  section: Partial<IDefinitionSectionArray<IProposal, keyof IProposal, never>>,
  property: string,
  sectionItem: any,
) => section?.mapping?.map((mapping) => sectionItem[mapping.key]).map((data) => data[property]) ?? []

const isSinglePersonEntry = (section: IDefinitionSectionObject<IProposal, keyof IProposal>) =>
  section.key === 'applicant' || section.key === 'projectResponsible'

const HideReviewCheckbox = (section: any) => section.key === 'userProject' || section.key === 'biosample'

function getVisibleSections(sections: any[]) {
  return sections.filter((section) => {
    if (section.shouldHide) {
      return false
    }
    // Special case for biosample section
    if (section.key === 'userProject' && section.sectionLabel === 'proposal.selectedBioSamples') {
      return shouldShowBiosampleSection(proposalData.value)
    }
    return true
  })
}

const shouldShowBiosampleSection = (proposal?: IProposal): boolean => {
  if (!proposal) {
    return false
  }

  const typeOfUse = proposal.userProject?.typeOfUse?.usage
  if (!typeOfUse || !typeOfUse.includes(ProposalTypeOfUse.Biosample)) {
    return false
  }

  return true
}

function getVisibleCards(cards: any, dto: any) {
  return cards.filter((card: any) => {
    if (shouldHideReviewCard(dto, card.hideIfOtherValueIsTruthy) || card.shouldHide) {
      return false
    }
    if (card.loopOn) {
      const loopData = dto[card.key]?.[card.loopOn]
      return Array.isArray(loopData) && loopData.length > 0
    }
    return true
  })
}

function getVisibleItems(items: any[], card: any) {
  return items
}

onMounted(async () => {
  await fetchProposal()
  await fetchComments()
  await scrollToAnchor()

  const lm = await locationStore.getLocationLookupMap()
  locationMapRef.value = lm
})
</script>

<style lang="scss">
.review-proposal {
  margin-bottom: 5em;
  position: relative;

  .review-label {
    .label-checkbox {
      margin-left: auto;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    span:not(:last-child):after {
      content: ' ';
    }
  }

  .inline-review-area {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
