<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { ProposalType } from '@/types/proposal-type.enum'
import UacMemberDetailsApplicationForm from './UacMemberDetailsApplicationForm.vue'
import ResearcherDetailsRegisteringForm from './ResearcherDetailsRegisteringForm.vue'

const proposalStore = useProposalStore()

const currentComponent = computed(() => {
  const proposalType = proposalStore.currentProposal?.type

  // For RegisteringForm, use the same view as Researcher
  if (proposalType === ProposalType.RegisteringForm) {
    return ResearcherDetailsRegisteringForm
  }

  // For ApplicationForm, use UAC-specific view
  return UacMemberDetailsApplicationForm
})
</script>
