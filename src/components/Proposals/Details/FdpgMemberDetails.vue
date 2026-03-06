<template>
  <component :is="currentComponent" v-if="currentComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { ProposalType } from '@/types/proposal-type.enum'
import FdpgMemberDetailsApplicationForm from './FdpgMemberDetailsApplicationForm.vue'
import FdpgMemberDetailsRegisteringForm from './FdpgMemberDetailsRegisteringForm.vue'

const proposalStore = useProposalStore()

const currentComponent = computed(() => {
  const proposalType = proposalStore.currentProposal?.type

  if (proposalType === ProposalType.RegisteringForm) {
    return FdpgMemberDetailsRegisteringForm
  }

  if (proposalType === ProposalType.ApplicationForm) {
    return FdpgMemberDetailsApplicationForm
  }

  return FdpgMemberDetailsApplicationForm
})
</script>
