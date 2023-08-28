<template>
  <section class="review-proposal">
    <div class="lead">
      <h1 class="title">{{ $t('proposal.mIIUsageApplicationForm') }}</h1>
      <div>
        <el-button type="primary" size="large" @click="openDetails" data-testId="button__projectDetails">{{ $t('proposal.projectDetails') }}</el-button>
      </div>
    </div>

    <template v-for="(section, sIdx) in sections" :key="'section' + sIdx">
      <h2 v-if="!(section.kind === 'single' && section.card.cardLabel === null)">{{ $t(section.sectionLabel) }}</h2>

      <template v-if="section.kind === 'array' && proposalData">
        <div
          v-for="(sectionItem, sectionItemIdx) in (proposalData[section.key] as any[])"
          :key="'item' + sectionItemIdx"
        >
          <section role="region" class="print-region">
            <h3>
              <span
                v-for="(labelKey, labelKeyIdx) in section.arrayLabel"
                :key="'h3' + sectionItemIdx + 'Key' + labelKeyIdx"
                >{{ sectionItem[section.arrayLabelKey][labelKey.key] ?? labelKey.key }}</span
              >
            </h3>

            <template v-for="(card, cardIdx) in section.mapping" :key="'card' + cardIdx">
              <ReviewCard
                v-if="!shouldHideReviewCard(sectionItem, card.hideIfOtherValueIsTruthy)"
                :dto="sectionItem"
                :card="card"
                headline="h4"
                :is-draft="proposalStore.currentProposal?.status === ProposalStatus.Draft"
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
        ></ReviewCard>
      </section>

      <template v-else-if="section.kind === 'object' && proposalData">
        <section
          v-for="(card, cardIdx) in section.mapping"
          :key="'objectCard' + cardIdx"
          role="region"
          class="print-region"
        >
          <ReviewCard
            v-if="!shouldHideReviewCard(proposalData[section.key], card.hideIfOtherValueIsTruthy)"
            :dto="proposalData[section.key]"
            :card="card"
            :is-draft="proposalStore.currentProposal?.status === ProposalStatus.Draft"
          ></ReviewCard>
        </section>
      </template>
    </template>

    <ReviewLabel html-for class="form-label-mt-4" title="proposal.appendix" headline="h2" />
    <DocumentList
      :documents="uploadsForType"
      :proposal-id="proposalId"
      :is-loading="false"
      :is-disabled="true"
      :two-columns="true"
      empty-alert-text="proposal.noAttachmentsYet"
    />
  </section>
</template>

<script setup lang="ts">
import DocumentList from '@/components/Proposals/Details/DocumentList.vue'
import ReviewLabel from '@/components/ReviewLabel.vue'
import type { DefinitionSection } from '@/components/Shared/definition-card.types'
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
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { applicantSection } from '@/constants/print-structure/applicant-section'
import { projectResponsibilitySection } from '@/constants/print-structure/project-responsibility-section'
import { projectUserSection } from '@/constants/print-structure/project-user-section'
import useNotifications from '@/composables/use-notifications'
import { ProposalStatus } from '@/types/proposal.types'

const sections: DefinitionSection<IProposal, keyof IProposal>[] = [
  applicantSection,
  projectResponsibilitySection,
  projectUserSection,
  participantSection,
  userProjectSection,
  requestedDataSection,
]

const proposalData = ref<IProposal>()

const layoutStore = useLayoutStore()
const router = useRouter()
const { params, query } = useRoute()
const proposalId = computed(() => params.id as string)
const proposalStore = useProposalStore()
const commentStore = useCommentStore()

const { uploadsForType } = useUpload(proposalId, [
  DirectUpload.GeneralAppendix,
  DirectUpload.EthicVote,
  DirectUpload.EthicVoteDeclarationOfNonResponsibility,
  UseCaseUpload.ProposalPDF,
])

const { showErrorMessage } = useNotifications()

const openDetails = () => {
  router.push({
    name: RouteName.ProposalDetails,
    params: { id: params.id },
  })
}

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

const shouldHideReviewCard = (dto: any, hideIfOtherValueIsTruthy?: [string, string]) => {
  if (!hideIfOtherValueIsTruthy) {
    return false
  }
  const [parentKey, secondLevelKey] = hideIfOtherValueIsTruthy

  if (Array.isArray(dto?.[parentKey]?.[secondLevelKey])) {
    return dto?.[parentKey]?.[secondLevelKey].length
  } else {
    return dto?.[parentKey]?.[secondLevelKey]
  }
}

onMounted(async () => {
  await fetchProposal()
  await fetchComments()
  await scrollToAnchor()
})
</script>

<style lang="scss">
.review-proposal {
  margin-bottom: 5em;

  .lead {
    margin-bottom: 37px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      margin: 0;
      font-size: 32px;
    }
  }

  counter-reset: h2 h3 h4;
@supports not (-moz-appearance:none) {

  h1 {
    counter-reset: h2;
  }

  h2 {
    counter-reset: h3;
  }

  h3 {
    counter-reset: h4;
  }
}

@supports (-moz-appearance:none) {

  h1 {
    counter-set: h2;
  }

  h2 {
    counter-set: h3;
  }

  h3 {
    counter-set: h4;
  }
}
  h2::before {
    counter-increment: h2;
    content: counter(h2) '. ';
  }

  h3::before {
    counter-increment: h3;
    content: counter(h2) '.' counter(h3) '. ';
  }

  h4::before {
    counter-increment: h4;
    content: counter(h2) '.' counter(h3) '.' counter(h4) '. ';
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
}
</style>
