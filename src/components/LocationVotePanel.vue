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
import type { IConditionalApproval} from '@/types/proposal.types';
import { ProposalStatus } from '@/types/proposal.types'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { computed } from 'vue'
import LocationVotePanelUacVotes from './LocationVotePanelUacVotes.vue'

const proposalStore = useProposalStore()

const progressItems = computed(() => {
  const numberOfRequestedLocations = proposalStore.currentProposal?.numberOfRequestedLocations ?? 0
  const requestedButExcludedLocations = proposalStore.currentProposal?.requestedButExcludedLocations ?? []
  const uacApprovedLocations = proposalStore.currentProposal?.uacApprovedLocations ?? []

  const numberOfVotedLocations = requestedButExcludedLocations.length + uacApprovedLocations.length
  const votesCompleted = numberOfVotedLocations >= numberOfRequestedLocations

  const desiredDataAmount = proposalStore.currentProposal?.requestedData.desiredDataAmount ?? 0
  const totalPromisedDataAmount = proposalStore.currentProposal?.totalPromisedDataAmount ?? 0
  const dataAmountReached = totalPromisedDataAmount >= desiredDataAmount

  const numberOfApprovedLocationsInContractingStatus = proposalStore.currentProposal?.numberOfApprovedLocations ?? 0

  const finalUacApproval = proposalStore.currentProposal?.uacApprovals ?? []
  const finalConditionalApproval = proposalStore.currentProposal?.conditionalApprovals ?? []

  const locationsWithSignDecision = [...finalUacApproval, ...finalConditionalApproval].filter((approval) => {
    // Conditional approval might be declined before
    const isFullyAccepted =
      (approval as IConditionalApproval).isAccepted !== undefined
        ? (approval as IConditionalApproval).isAccepted === true
        : true
    const isSignDecisionDone = approval.signedAt !== undefined

    return isFullyAccepted && isSignDecisionDone
  })
  const signingComplete = locationsWithSignDecision.length >= numberOfApprovedLocationsInContractingStatus

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
        value: locationsWithSignDecision.length,
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
@import 'src/assets/sass/variable';
.location-vote-progress {
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 52px;
  background-color: $gray-200;

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
        background-color: $red-100;
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
