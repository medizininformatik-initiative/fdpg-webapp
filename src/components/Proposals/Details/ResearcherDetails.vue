<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { ProposalType } from '@/types/proposal-type.enum'
import ResearcherDetailsApplicationForm from './ResearcherDetailsApplicationForm.vue'
import ResearcherDetailsRegisteringForm from './ResearcherDetailsRegisteringForm.vue'

const proposalStore = useProposalStore()

const currentComponent = computed(() => {
  const proposalType = proposalStore.currentProposal?.type

  if (proposalType === ProposalType.RegisteringForm) {
    return ResearcherDetailsRegisteringForm
  }

  if (proposalType === ProposalType.ApplicationForm) {
    return ResearcherDetailsApplicationForm
  }

  return ResearcherDetailsApplicationForm
})
</script>
