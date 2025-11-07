import { computed, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { SyncStatus } from '@/types/sync-status.enum'
import { ProposalStatus } from '@/types/proposal.types'
import useNotifications from '@/composables/use-notifications'

export function useProposalSync() {
  const proposalStore = useProposalStore()
  const messageBoxStore = useMessageBoxStore()
  const { showSuccessMessage, showErrorMessage } = useNotifications()
  const isSyncing = ref(false)

  const proposal = computed(() => proposalStore.currentProposal)
  const syncStatus = computed(() => proposal.value?.registerInfo?.syncStatus)
  const syncError = computed(() => proposal.value?.registerInfo?.lastSyncError)
  const lastSyncedAt = computed(() => proposal.value?.registerInfo?.lastSyncedAt)
  const retryCount = computed(() => proposal.value?.registerInfo?.syncRetryCount || 0)

  const hasRequiredRegisterInfo = computed(() => {
    const registerInfo = proposal.value?.registerInfo
    if (!registerInfo) return false

    const hasProjectUrl = !!registerInfo.projectUrl && registerInfo.projectUrl.trim().length > 0
    const hasProjectCategory = !!registerInfo.projectCategory && registerInfo.projectCategory.trim().length > 0
    const hasDiagnoses = registerInfo.diagnoses && registerInfo.diagnoses.length > 0
    const hasProcedures = registerInfo.procedures && registerInfo.procedures.length > 0

    return hasProjectUrl && hasProjectCategory && hasDiagnoses && hasProcedures
  })

  const missingRequiredFields = computed(() => {
    const registerInfo = proposal.value?.registerInfo
    if (!registerInfo) return []

    const missing: string[] = []
    if (!registerInfo.projectUrl || registerInfo.projectUrl.trim().length === 0) {
      missing.push('Project URL')
    }
    if (!registerInfo.projectCategory || registerInfo.projectCategory.trim().length === 0) {
      missing.push('Project Category')
    }
    if (!registerInfo.diagnoses || registerInfo.diagnoses.length === 0) {
      missing.push('Diagnoses')
    }
    if (!registerInfo.procedures || registerInfo.procedures.length === 0) {
      missing.push('Procedures')
    }
    return missing
  })

  const shouldShowSyncButton = computed(() => {
    if (!proposal.value) return false

    const status = proposal.value.status
    const currentSyncStatus = syncStatus.value

    if (status !== ProposalStatus.Published) return false

    return (
      currentSyncStatus === SyncStatus.OutOfSync ||
      currentSyncStatus === SyncStatus.SyncFailed ||
      currentSyncStatus === SyncStatus.Syncing
    )
  })

  const canSync = computed(() => {
    if (!shouldShowSyncButton.value) return false

    const currentSyncStatus = syncStatus.value

    if (currentSyncStatus === SyncStatus.OutOfSync) {
      return hasRequiredRegisterInfo.value
    }

    if (currentSyncStatus === SyncStatus.SyncFailed) {
      return hasRequiredRegisterInfo.value
    }

    return false
  })

  const isRetry = computed(() => syncStatus.value === SyncStatus.SyncFailed)

  const syncDisabledReason = computed(() => {
    if (canSync.value) return null
    if (!shouldShowSyncButton.value) return null

    if (missingRequiredFields.value.length > 0) {
      return `Cannot sync: Missing required fields (${missingRequiredFields.value.join(', ')}). Please complete the Registration Info section before syncing.`
    }

    return 'Cannot sync at this time'
  })

  const buttonLabel = computed(() => {
    if (isSyncing.value) return 'proposal.syncing'
    if (syncStatus.value === SyncStatus.SyncFailed) return 'proposal.retrySync'
    if (syncStatus.value === SyncStatus.OutOfSync) return 'proposal.resync'
    return 'proposal.syncToWebsite'
  })

  const syncStatusLabel = computed(() => {
    switch (syncStatus.value) {
      case SyncStatus.Synced:
        return 'proposal.synced'
      case SyncStatus.OutOfSync:
        return 'proposal.outOfSync'
      case SyncStatus.SyncFailed:
        return 'proposal.syncFailed'
      case SyncStatus.Syncing:
        return 'proposal.syncing'
      case SyncStatus.NotSynced:
        return 'proposal.notSynced'
      default:
        return ''
    }
  })

  const formatDate = (date: Date | string): string => {
    const d = new Date(date)
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
  }

  const lastSyncInfo = computed(() => {
    if (!lastSyncedAt.value) return ''
    return `Last synced: ${formatDate(lastSyncedAt.value)}`
  })

  const syncProposal = async (proposalId: string): Promise<void> => {
    if (!canSync.value || isSyncing.value) return

    const confirmMessage = isRetry.value
      ? `Are you sure you want to retry syncing this project? (Attempt ${retryCount.value + 1})`
      : syncStatus.value === SyncStatus.OutOfSync
        ? 'This project has been modified. Do you want to sync the changes to the external website?'
        : 'Do you want to publish this project to the external website?'

    messageBoxStore.setMessageBoxInfo({
      cancelButtonText: 'general.cancel',
      cancelButtonClass: 'el-button--text',
      showCancelButton: true,
      title: 'proposal.confirmSync' as any,
      message: confirmMessage as any,
      confirmButtonText: 'proposal.sync' as any,
      callback: async (decision: DecisionType) => {
        if (decision !== 'confirm') return

        try {
          isSyncing.value = true

          let result

          if (isRetry.value) {
            result = await proposalStore.retrySyncProposal(proposalId)
          } else {
            result = await proposalStore.syncProposal(proposalId)
          }

          if (result.success) {
            showSuccessMessage('Project successfully synced to external website!')
          } else {
            showErrorMessage(`Sync failed: ${result.error || 'Unknown error'}`)
          }
        } catch (error: any) {
          showErrorMessage(`Sync failed: ${error.message || 'Unknown error'}`)
        } finally {
          isSyncing.value = false
        }
      },
    })
  }

  const syncAllProposals = async (): Promise<void> => {
    messageBoxStore.setMessageBoxInfo({
      cancelButtonText: 'general.cancel',
      cancelButtonClass: 'el-button--text',
      showCancelButton: true,
      title: 'proposal.confirmBulkSync' as any,
      message: 'Do you want to sync all eligible projects to the external website? This may take a while.' as any,
      confirmButtonText: 'proposal.syncAll' as any,
      callback: async (decision: DecisionType) => {
        if (decision !== 'confirm') return

        try {
          isSyncing.value = true

          const result = await proposalStore.syncAllProposals()

          if (result.synced === result.total) {
            showSuccessMessage(`Successfully synced all ${result.total} projects!`)
          } else {
            const errorList = result.errors.map((e) => `- ${e.projectAbbreviation}: ${e.error}`).join('\n')

            messageBoxStore.setMessageBoxInfo({
              cancelButtonText: 'general.ok' as any,
              cancelButtonClass: 'el-button--text',
              showCancelButton: false,
              title: 'proposal.bulkSyncResults' as any,
              message: `Synced ${result.synced} of ${result.total} projects.\n\nFailed:\n${errorList}` as any,
              confirmButtonText: 'general.ok' as any,
              callback: async () => {},
            })
          }
        } catch (error: any) {
          showErrorMessage(`Bulk sync failed: ${error.message || 'Unknown error'}`)
        } finally {
          isSyncing.value = false
        }
      },
    })
  }

  return {
    // State
    isSyncing,
    syncStatus,
    syncError,
    lastSyncedAt,
    retryCount,
    canSync,
    isRetry,
    hasRequiredRegisterInfo,
    shouldShowSyncButton,
    missingRequiredFields,
    syncDisabledReason,

    // Computed
    buttonLabel,
    syncStatusLabel,
    lastSyncInfo,

    // Actions
    syncProposal,
    syncAllProposals,
    formatDate,
  }
}
