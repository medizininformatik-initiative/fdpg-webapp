<template>
  <div>
    <div class="header-row">
      <h2>{{ t('proposal.fdpgCheckNotes') }}</h2>
    </div>
    <div v-if="isEditMode">
      <FdpgTextEditor v-model="fdpgCheckNotes" :placeholder="t('proposal.checkNotesPlaceHolder')"></FdpgTextEditor>
      <el-button class="button__margin" type="primary" @click="sendFdpgCheckNotes">{{ $t('general.save') }}</el-button>
    </div>
    <div class="check-note-content" v-else>
      {{ proposalStore?.currentProposal?.fdpgCheckNotes }}
    </div>
    <el-divider />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import useNotifications from '@/composables/use-notifications'
import { useI18n } from 'vue-i18n'
import { ProposalStatus } from '@/types/proposal.types'
import FdpgTextEditor from './FdpgTextEditor.vue'

const { t } = useI18n()
const { params } = useRoute()
const proposalId = params.id as string
const proposalStore = useProposalStore()
const authStore = useAuthStore()
const { showSuccessMessage, showErrorMessage } = useNotifications()
const fdpgCheckNotes = ref(proposalStore?.currentProposal?.fdpgCheckNotes ?? '')
const sendFdpgCheckNotes = async () => {
  try {
    await proposalStore.updateFdpgCheckNotes(proposalId, fdpgCheckNotes.value)
    showSuccessMessage(t('general.submitted'))
  } catch (error: any) {
    showErrorMessage(error.message)
  }
}
const isEditMode = computed(
  () =>
    authStore.singleKnownRole === Role.FdpgMember &&
    proposalStore?.currentProposal?.status === ProposalStatus.FdpgCheck,
)
</script>

<style lang="scss" scoped>
.button__margin {
  margin-top: 20px;
}
.check-note-content {
  white-space: pre-line;
}
</style>
