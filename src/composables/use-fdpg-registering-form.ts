import { useI18n } from 'vue-i18n'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { useProposalSync } from '@/composables/use-proposal-sync'
import { ProposalStatus } from '@/types/proposal.types'

export function useFdpgRegisteringForm(
  proposalId: any,
  changeStatus: (status: ProposalStatus) => Promise<void>,
  showErrorMessage: (msg: string) => void,
) {
  const messageBoxStore = useMessageBoxStore()
  const { t } = useI18n()

  const {
    isSyncing,
    canSync,
    shouldShowSyncButton,
    syncDisabledReason,
    buttonLabel: syncButtonLabel,
    syncProposal: performSync,
  } = useProposalSync()

  const messageBoxDefaults = {
    cancelButtonText: t('general.cancel'),
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
  }

  const handleSyncProposalClick = async () => {
    if (!canSync.value) {
      showErrorMessage(syncDisabledReason.value || '')
      return
    }

    if (proposalId.value) {
      await performSync(proposalId.value)
    }
  }

  const handleAcceptProposalClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.acceptProposalModalTitle',
      message: 'proposal.acceptProposalModalDescription',
      confirmButtonText: 'proposal.acceptProposal',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Published) : undefined,
    })
  }

  const handleRejectApplicationClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.rejectRequestModalTitle',
      message: 'proposal.rejectRequestModalDescription',
      confirmButtonText: 'proposal.rejectApplication',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Rejected) : undefined,
    })
  }

  const handleRequestRevisionClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.requestRevisionModalTitle',
      message: 'proposal.requestRevisionModalDescription',
      confirmButtonText: 'proposal.requestRevision',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Rework) : undefined,
    })
  }

  return {
    // Sync State
    isSyncing,
    canSync,
    shouldShowSyncButton,
    syncDisabledReason,
    syncButtonLabel,

    // Methods
    handleSyncProposalClick,
    handleAcceptProposalClick,
    handleRejectApplicationClick,
    handleRequestRevisionClick,
  }
}
