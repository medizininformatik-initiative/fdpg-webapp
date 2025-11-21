<template>
  <section role="region">
    <h2 class="section-title">
      {{ t('proposal.historyOfTheProject') }}
    </h2>
    <div class="project-history">
      <p v-for="({ date, label }, index) in historyList" :key="`history-item-${index}`" class="project-history__item">
        <span>{{ date }}</span>
        {{ label }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { ProjectHistoryType } from '@/types/proposal.types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const proposalStore = useProposalStore()
const projectHistory = computed(() => proposalStore.currentProposal?.history ?? [])

const historyList = computed(() => {
  if (projectHistory.value.length === 0) {
    return []
  }

  return projectHistory.value.map((item) => {
    const translationParameter: Record<string, string> = {}

    switch (item.type) {
      case ProjectHistoryType.FdpgLocationVoteReverted:
        if (item.location) {
          translationParameter['location'] = item.location
        }
        break

      case ProjectHistoryType.ParticipantAdded:
      case ProjectHistoryType.ParticipantRemoved:
        if (item.data?.participantName) {
          translationParameter['participantName'] = item.data.participantName as string
        }
        break

      case ProjectHistoryType.ProjectAssigneChange:
        if (item.data?.newAssigneeMail) {
          translationParameter['newAssigneeMail'] = item.data.newAssigneeMail as string
        }
        break
      case ProjectHistoryType.ProposalCopyAsInternalRegistration:
        if (item.data?.originalProposalAbbreviation) {
          translationParameter['originalProposalAbbreviation'] = item.data.originalProposalAbbreviation as string
        }
        break
    }

    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : new Date().toLocaleDateString() // Fallback

    // 5. Return the final object
    return {
      date: formattedDate,
      label: t(`history.${item.type}`, translationParameter),
    }
  })
})
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.project-history {
  .project-history__item {
    color: $black;
    display: flex;
    margin: 20px 0;
    font-weight: 500;

    span {
      display: block;
      color: $gray-900;
      margin-right: 31px;
    }
  }
}
</style>
