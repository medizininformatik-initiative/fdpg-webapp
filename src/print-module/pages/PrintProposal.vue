<template>
  <h1 class="title">{{ t('proposal.mIIUsageApplicationForm') }}</h1>
  <h2>1. {{ t(overviewSection.sectionLabel) }}</h2>
  <section v-for="(card, cardIdx) in overviewSection.mapping" :key="'card' + cardIdx" role="region">
    <PrintCard
      class="print-region"
      :dto="overview"
      :card="card"
      :number="`1.${cardIdx + 1}`"
      :headline="card.headline"
    ></PrintCard>
  </section>
  <template v-for="(section, sIdx) in getVisibleSections(sections)" :key="'section' + sIdx">
    <h2>{{ sIdx + 2 }}. {{ t(section.sectionLabel) }}</h2>

    <template v-if="section.kind === 'array' && proposalData">
      <div
        v-for="(sectionItem, sectionItemIdx) in getVisibleItems(proposalData[section.key], section)"
        :key="'item' + sectionItemIdx"
      >
        <section role="region" class="print-region">
          <h3>
            {{ `${sIdx + 2}.${sectionItemIdx + 1}.` }}
            <span v-for="(labelKey, labelKeyIdx) in section.arrayLabel" :key="labelKeyIdx">
              {{ sectionItem[section.arrayLabelKey][labelKey.key] ?? labelKey.key }}
            </span>
          </h3>
          <template v-for="(card, cardIdx) in getVisibleCards(section.mapping, sectionItem)" :key="'card' + cardIdx">
            <PrintCard
              :dto="sectionItem"
              :card="card"
              headline="h4"
              :number="`${sIdx + 2}.${sectionItemIdx + 1}.${cardIdx + 1}`"
            ></PrintCard>
          </template>
        </section>
      </div>
    </template>

    <section v-else-if="section.kind === 'single' && proposalData" role="region" class="print-region">
      <PrintCard :dto="proposalData" :card="section.card" :number="`${sIdx + 2}`"></PrintCard>
    </section>

    <template v-else-if="section.kind === 'object' && proposalData">
      <section
        v-for="(card, cardIdx) in getVisibleCards(section.mapping, proposalData[section.key])"
        :key="'card' + cardIdx"
        role="region"
        class="print-region"
      >
        <PrintCard :dto="proposalData[section.key]" :card="card" :number="`${sIdx + 2}.${cardIdx + 1}`"></PrintCard>
      </section>
    </template>
  </template>

  <h2>{{ getVisibleSections(sections).length + 2 }}. {{ t(dataPrivacySection.sectionLabel) }}</h2>
  <section v-for="(card, cardIdx) in dataPrivacySection.mapping" :key="'privacy-card' + cardIdx" role="region">
    <PrintCard
      class="print-region"
      :dto="dataPrivacyOverview"
      :card="card"
      :number="`${getVisibleSections(sections).length + 2}.${cardIdx + 1}`"
    ></PrintCard>
  </section>
</template>

<script setup lang="ts">
import type { DefinitionSection, IVirtualWrap } from '@/components/Shared/definition-card.types'
import { applicantSection } from '@/constants/print-structure/applicant-section'
import { biosampleSection } from '@/constants/print-structure/biosample-section'
import type { IDataPrivacyOverview } from '@/constants/print-structure/data-privacy-section'
import { dataPrivacySection } from '@/constants/print-structure/data-privacy-section'
import type { IOverview } from '@/constants/print-structure/overview-section'
import { overviewSection } from '@/constants/print-structure/overview-section'
import { participantSection } from '@/constants/print-structure/participant-section'
import { projectResponsibilitySection } from '@/constants/print-structure/project-responsibility-section'
import { projectUserSection } from '@/constants/print-structure/project-user-section'
import { requestedDataSection } from '@/constants/print-structure/requested-data-section'
import { userProjectSection } from '@/constants/print-structure/user-project-section'
import PrintCard from '@/print-module/components/PrintCard.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { DataPrivacyTextsContentKeys } from '@/types/data-privacy.types'
import type { ILocationKeyLabel } from '@/types/location.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { ProposalTypeOfUse } from '@/types/proposal.types'
import type { IProposal } from '@/types/proposal.types'
import { transformForm } from '@/utils/form-transform'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

class FailedStateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FailedStateError'
  }
}

type extendedWindow = typeof window & {
  data: IProposal
  dataPrivacyTexts: any
  dataSources: PlatformIdentifier[]
  locationLookupMap: Record<string, ILocationKeyLabel>
}

const proposalData = ref<IProposal>()
const dataPrivacyTexts = ref<DataPrivacyTextsContentKeys[]>()
const assignedDataSources = ref<PlatformIdentifier[]>()
const locationLookupMap = ref<Record<string, ILocationKeyLabel>>({})

const sections = computed<DefinitionSection<IProposal, keyof IProposal>[]>(() => [
  applicantSection(locationLookupMap.value),
  projectResponsibilitySection(locationLookupMap.value),
  projectUserSection,
  participantSection(locationLookupMap.value),
  userProjectSection(assignedDataSources.value, locationLookupMap.value, proposalData.value?.selectedDataSources),
  requestedDataSection,
  biosampleSection(assignedDataSources.value, proposalData.value?.selectedDataSources),
])

const { t } = useI18n()

const overview = computed(() => {
  return {
    content: {
      ownerName: proposalData.value?.ownerName,
      ownerEmail: proposalData.value?.owner.email,
      ownerId: proposalData.value?.owner.id,
      submittedAt: proposalData.value?.submittedAt,
      projectAbbreviation: proposalData.value?.projectAbbreviation,
      proposalId: proposalData.value?._id,
      uploads: proposalData.value?.uploads,
      fdpgCheckNotes: proposalData.value?.fdpgCheckNotes,
    },
  } as IVirtualWrap<IOverview>
})

const dataPrivacyOverview = computed(() => {
  const data = dataPrivacyTexts.value ?? []
  if (proposalData.value?.userProject.typeOfUse.dataPrivacyExtra) {
    data.push({
      headline: t('proposal.dataPrivacyExtra'),
      text: proposalData.value?.userProject.typeOfUse.dataPrivacyExtra,
      translation: false,
    })
  }
  return { content: { data } } as IVirtualWrap<IDataPrivacyOverview>
})

const setUp = async () => {
  const data = (window as extendedWindow).data
  dataPrivacyTexts.value = (window as extendedWindow).dataPrivacyTexts
  assignedDataSources.value = (window as extendedWindow).dataSources
  locationLookupMap.value = (window as extendedWindow).locationLookupMap

  if (!data) {
    throw new FailedStateError('No Data')
  } else {
    proposalData.value = transformForm(data) as IProposal
  }
}

const shouldHidePrintCard = (dto: any, hideIfOtherValueIsTruthy?: [string, string]) => {
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

function getVisibleCards(cards: any, dto: any) {
  return cards.filter((card: any) => {
    if (shouldHidePrintCard(dto, card.hideIfOtherValueIsTruthy) || card.shouldHide) {
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

onMounted(async () => await setUp())
</script>
