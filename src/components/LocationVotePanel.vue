<template>
  <section role="region" class="section location-vote-progress">
    <div class="progress-row">
      <div
        v-for="(progressItem, idx) in progressItems"
        :key="'progress' + idx"
        class="progress-item"
        :class="progressItem.status"
      >
        <h2>{{ $t(progressItem.title) }}</h2>
        <el-progress :percentage="progressItem.max ? (progressItem.value / progressItem.max) * 100 : 0">
          <span class="progress-content">{{ progressItem.value }} / {{ progressItem.max }}</span>
        </el-progress>
      </div>
    </div>
    <LocationVotePanelUacVotes />
  </section>
</template>

<script setup lang="ts">
import { ProposalStatus } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { computed } from 'vue'
import LocationVotePanelUacVotes from './LocationVotePanelUacVotes.vue'

const proposalStore = useProposalStore()

const progressItems = computed(() => {
  const numberOfRequestedLocations = proposalStore.currentProposal?.numberOfRequestedLocations ?? 0
  const requestedButExcludedLocations = proposalStore.currentProposal?.requestedButExcludedLocationsCount ?? 0
  const uacApprovedAndSelectedLocations = proposalStore.currentProposal?.uacApprovedLocationsCount ?? 0

  const numberOfVotedLocations = requestedButExcludedLocations + uacApprovedAndSelectedLocations
  const votesCompleted = numberOfVotedLocations >= numberOfRequestedLocations

  const desiredDataAmount = proposalStore.currentProposal?.requestedData.desiredDataAmount ?? 0
  const totalPromisedDataAmount = proposalStore.currentProposal?.totalPromisedDataAmount ?? 0

  const dataAmountReached = totalPromisedDataAmount >= desiredDataAmount

  const numberOfApprovedLocationsInContractingStatus = proposalStore.currentProposal?.numberOfApprovedLocations ?? 0
  const numberOfApprovedAndSelectedLocationsInContractingStatus =
    (proposalStore.currentProposal?.signedContractsCount ?? 0) +
    (proposalStore.currentProposal?.signedContractsPendingCount ?? 0)

  const signingComplete =
    numberOfApprovedAndSelectedLocationsInContractingStatus >= numberOfApprovedLocationsInContractingStatus

  const getParticipants = () => {
    const status = proposalStore.currentProposal?.status
    if (status === ProposalStatus.LocationCheck) {
      return {
        status: { success: votesCompleted },
        title: 'proposal.uacVotum',
        value: numberOfVotedLocations,
        max: numberOfRequestedLocations,
      }
    } else {
      return {
        status: { success: signingComplete },
        title: 'proposal.signedContracts',
        value: proposalStore.currentProposal?.signedContractsCount ?? 0,
        max: numberOfApprovedLocationsInContractingStatus,
      }
    }
  }
  return [
    getParticipants(),
    {
      status: { success: dataAmountReached },
      title: 'proposal.proposedDataVolume',
      value: totalPromisedDataAmount,
      max: desiredDataAmount,
    },
  ]
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
.location-vote-progress {
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 52px;
  background-color: $gray-300;

  .progress-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 2rem;

    .progress-item {
      width: 46%;

      :deep(.el-progress-bar__inner) {
        background-color: $blue;
      }

      &.success :deep(.el-progress-bar__inner) {
        background-color: $green;
      }

      &.danger :deep(.el-progress-bar__inner) {
        background-color: $error;
      }

      .progress-content {
        white-space: nowrap;
        padding: 0 1rem;
      }
    }

    @media (max-width: $lg) {
      .progress-item {
        width: 100%;
      }
    }
  }
}
</style>
