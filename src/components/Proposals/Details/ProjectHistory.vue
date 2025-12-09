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
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types'
import { ProjectHistoryType } from '@/types/proposal.types'
import { getLocaleDateString } from '@/utils/date.util'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const projectHistory = computed(() => proposalStore.currentProposal?.history ?? [])

const locationLookupMap: Ref<Record<string, ILocation>> = ref({})

const historyList = computed(() => {
  if (projectHistory.value.length === 0) {
    return []
  }

  return projectHistory.value.map((item) => {
    const translationParameter: Record<string, string> = {}

    switch (item.type) {
      case ProjectHistoryType.FdpgLocationVoteReverted:
        if (item.location) {
          translationParameter['location'] = '' + locationLookupMap.value[item.location]
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
      case ProjectHistoryType.DmoRequest:
        if (item.data?.requestedDms) {
          translationParameter['requestedDms'] = '' + locationLookupMap.value[item.data.requestedDms]
        }
        break
      case ProjectHistoryType.DmoAccept:
      case ProjectHistoryType.DmoDeny:
        if (item.location) {
          translationParameter['location'] = '' + locationLookupMap.value[item.location]
        }
        break
      case ProjectHistoryType.DataDeliveryStarted:
      case ProjectHistoryType.DataDeliveryCanceled:
      case ProjectHistoryType.DataDeliveryForwarded:
      case ProjectHistoryType.DataDeliveryConcluded:
        if (item.data?.deliveryName) {
          translationParameter['deliveryName'] = item.data?.deliveryName as string
        }
        break
    }

    const formattedDate = item.createdAt ? getLocaleDateString(new Date(item.createdAt)) : ''

    return {
      date: formattedDate,
      label: t(`history.${item.type}`, translationParameter),
    }
  })
})

onMounted(async () => {
  locationLookupMap.value = await locationStore.getLocationLookupMap()
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
