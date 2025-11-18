import { computed, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { SyncStatus } from '@/types/sync-status.enum'
import { ProposalStatus } from '@/types/proposal.types'
import useNotifications from '@/composables/use-notifications'
import { useI18n } from 'vue-i18n'
export function useProposalSync() {
  const proposalStore = useProposalStore()
  const messageBoxStore = useMessageBoxStore()
  const { showSuccessMessage, showErrorMessage } = useNotifications()
  const isSyncing = ref(false)
  const { t } = useI18n()
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
      currentSyncStatus === SyncStatus.Syncing ||
      currentSyncStatus === SyncStatus.NotSynced
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

    if (currentSyncStatus === SyncStatus.NotSynced) {
      return hasRequiredRegisterInfo.value
    }

    return false
  })

  const isRetry = computed(() => syncStatus.value === SyncStatus.SyncFailed)

  const syncDisabledReason = computed(() => {
    if (canSync.value) return null
    if (!shouldShowSyncButton.value) return null

    if (missingRequiredFields.value.length > 0) {
      return t('registeringForm.syncDisabledMissingFields', { fields: missingRequiredFields.value.join(', ') })
    }

    return t('registeringForm.syncDisabledGeneric')
  })

  const buttonLabel = computed(() => {
    if (isSyncing.value) return 'registeringForm.syncing'
    if (syncStatus.value === SyncStatus.SyncFailed) return 'registeringForm.retrySync'
    if (syncStatus.value === SyncStatus.OutOfSync) return 'registeringForm.resync'

    return 'registeringForm.syncToWebsite'
  })

  const syncStatusLabel = computed(() => {
    switch (syncStatus.value) {
      case SyncStatus.Synced:
        return 'registeringForm.synced'
      case SyncStatus.OutOfSync:
        return 'registeringForm.outOfSync'
      case SyncStatus.SyncFailed:
        return 'registeringForm.syncFailed'
      case SyncStatus.Syncing:
        return 'registeringForm.syncing'
      case SyncStatus.NotSynced:
        return 'registeringForm.notSynced'
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
    return t('registeringForm.lastSynced', { date: formatDate(lastSyncedAt.value) })
  })

  const syncProposal = async (proposalId: string): Promise<void> => {
    if (!canSync.value || isSyncing.value) return

    const confirmMessage = isRetry.value
      ? t('registeringForm.confirmRetrySync', { attempt: retryCount.value + 1 })
      : syncStatus.value === SyncStatus.OutOfSync
        ? t('registeringForm.confirmResync')
        : t('registeringForm.confirmPublish')

    messageBoxStore.setMessageBoxInfo({
      cancelButtonText: 'general.cancel',
      cancelButtonClass: 'el-button--text',
      showCancelButton: true,
      title: 'registeringForm.confirmSync' as any,
      message: confirmMessage as any,
      confirmButtonText: 'registeringForm.sync' as any,
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
            showSuccessMessage(t('registeringForm.syncSuccess'))
          } else {
            showErrorMessage(
              t('registeringForm.syncFailed', { error: result.error || t('registeringForm.unknownError') }),
            )
          }
        } catch (error: any) {
          showErrorMessage(
            t('registeringForm.syncFailed', { error: error.message || t('registeringForm.unknownError') }),
          )
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
      title: 'registeringForm.confirmBulkSync' as any,
      message: t('registeringForm.confirmBulkSyncMessage') as any,
      confirmButtonText: 'registeringForm.syncAll' as any,
      callback: async (decision: DecisionType) => {
        if (decision !== 'confirm') return

        try {
          isSyncing.value = true

          const result = await proposalStore.syncAllProposals()

          if (result.synced === result.total) {
            showSuccessMessage(t('registeringForm.syncSuccessAll', { count: result.total }))
          } else {
            const errorList = result.errors.map((e) => `- ${e.projectAbbreviation}: ${e.error}`).join('\n')

            messageBoxStore.setMessageBoxInfo({
              cancelButtonText: 'general.ok' as any,
              cancelButtonClass: 'el-button--text',
              showCancelButton: false,
              title: 'registeringForm.bulkSyncResults' as any,
              message: `Synced ${result.synced} of ${result.total} projects.\n\nFailed:\n${errorList}` as any,
              confirmButtonText: 'general.ok' as any,
              callback: async () => {},
            })
          }
        } catch (error: any) {
          showErrorMessage(
            t('registeringForm.syncFailed', { error: error.message || t('registeringForm.unknownError') }),
          )
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
