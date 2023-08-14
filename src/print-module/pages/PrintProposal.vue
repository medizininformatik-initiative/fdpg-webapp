<template>
  <h1 class="title">{{ $t('proposal.mIIUsageApplicationForm') }}</h1>
  <h2>{{ $t(overviewSection.sectionLabel) }}</h2>
  <section v-for="(card, cardIdx) in overviewSection.mapping" :key="'card' + cardIdx" role="region">
    <PrintCard class="print-region" :dto="overview" :card="card"></PrintCard>
  </section>

  <template v-for="(section, sIdx) in sections" :key="'section' + sIdx">
    <h2>{{ $t(section.sectionLabel) }}</h2>

    <template v-if="section.kind === 'array' && proposalData">
      <div v-for="(sectionItem, sectionItemIdx) in proposalData[section.key] as any[]" :key="'item' + sectionItemIdx">
        <section role="region" class="print-region">
          <h3>
            <span v-for="(labelKey, labelKeyIdx) in section.arrayLabel" :key="labelKeyIdx"
              >{{ sectionItem[section.arrayLabelKey][labelKey.key] ?? labelKey.key }}
            </span>
          </h3>
          <template v-for="(card, cardIdx) in section.mapping" :key="'card' + cardIdx">
            <PrintCard
              v-if="!shouldHidePrintCard(sectionItem, card.hideIfOtherValueIsTruthy)"
              :dto="sectionItem"
              :card="card"
              headline="h4"
            ></PrintCard>
          </template>
        </section>
      </div>
    </template>

    <section v-else-if="section.kind === 'single' && proposalData" role="region" class="print-region">
      <PrintCard :dto="proposalData" :card="section.card"></PrintCard>
    </section>

    <template v-else-if="section.kind === 'object' && proposalData">
      <section v-for="(card, cardIdx) in section.mapping" :key="'card' + cardIdx" role="region" class="print-region">
        <PrintCard
          v-if="!shouldHidePrintCard(proposalData[section.key], card.hideIfOtherValueIsTruthy)"
          :dto="proposalData[section.key]"
          :card="card"
        ></PrintCard>
      </section>
    </template>
  </template>

  <h2>{{ $t(dataPrivacySection.sectionLabel) }}</h2>
  <section v-for="(card, cardIdx) in dataPrivacySection.mapping" :key="'privacy-card' + cardIdx" role="region">
    <PrintCard class="print-region" :dto="dataPrivacyOverview" :card="card"></PrintCard>
  </section>
</template>

<script setup lang="ts">
import type { DefinitionSection, IVirtualWrap } from '@/components/Shared/definition-card.types'
import { applicantSection } from '@/constants/print-structure/applicant-section'
import type { IDataPrivacyOverview} from '@/constants/print-structure/data-privacy-section';
import { dataPrivacySection } from '@/constants/print-structure/data-privacy-section'
import type { IOverview} from '@/constants/print-structure/overview-section';
import { overviewSection } from '@/constants/print-structure/overview-section'
import { participantSection } from '@/constants/print-structure/participant-section'
import { projectResponsibilitySection } from '@/constants/print-structure/project-responsibility-section'
import { projectUserSection } from '@/constants/print-structure/project-user-section'
import { requestedDataSection } from '@/constants/print-structure/requested-data-section'
import { userProjectSection } from '@/constants/print-structure/user-project-section'
import PrintCard from '@/print-module/components/PrintCard.vue'
import type { DataPrivacyTextsContentKeys } from '@/types/data-privacy.types'
import type { IProposal } from '@/types/proposal.types'
import { transformForm } from '@/utils/form-transform'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

class FailedStateError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FailedStateError'
  }
}

type extendedWindow = typeof window & { data: IProposal; dataPrivacyTexts: any }

const sections: DefinitionSection<IProposal, keyof IProposal>[] = [
  applicantSection,
  projectResponsibilitySection,
  projectUserSection,
  participantSection,
  userProjectSection,
  requestedDataSection,
]

const proposalData = ref<IProposal>()
const dataPrivacyTexts = ref<DataPrivacyTextsContentKeys[]>()

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
      fdpgCheckNotes: proposalData.value?.fdpgCheckNotes
    },
  } as IVirtualWrap<IOverview>
})

const dataPrivacyOverview = computed(() => {
  const data = dataPrivacyTexts.value ?? []
  if (proposalData.value?.userProject.typeOfUse.dataPrivacyExtra) {
    data.push({
      headline: t('proposal.dataPrivacyExtra'),
      text: proposalData.value?.userProject.typeOfUse.dataPrivacyExtra,
    })
  }
  return { content: { data } } as IVirtualWrap<IDataPrivacyOverview>
})

const setUp = async () => {
  const data = (window as extendedWindow).data
  dataPrivacyTexts.value = (window as extendedWindow).dataPrivacyTexts

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

onMounted(() => setUp())
</script>
