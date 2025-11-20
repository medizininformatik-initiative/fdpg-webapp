import { computed, ref, watch, onMounted, type Ref, markRaw, defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useLocationStore } from '@/stores/locations/location.store'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import useDraftDownload from '@/composables/use-draft-download'
import {
  ProposalStatus,
  type IProposal,
  type IFdpgChecklist,
  type IProjectAssignee,
  type ISelectedCohort,
} from '@/types/proposal.types'
import { ProposalType } from '@/types/proposal-type.enum'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { CommentType } from '@/types/comment.interface'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { UpdateQueue } from '@/utils/promise-queue.util'
import { Role } from '@/types/oidc.types'
import type { ILocation } from '@/types/location.types'
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { UploadFile } from 'element-plus'
import type { Deadlines } from '@/types/due-date.enum'

export function useFdpgProposalCommon() {
  const messageBoxStore = useMessageBoxStore()
  const authStore = useAuthStore()
  const { t } = useI18n()
  const { params } = useRoute()
  const proposalId = computed(() => params.id as string)
  const router = useRouter()
  const layoutStore = useLayoutStore()
  const proposalStore = useProposalStore()
  const locationStore = useLocationStore()
  const { showErrorMessage, showSuccessMessage } = useNotifications()

  const isSubmitting = ref(false)
  const showPublicationsAndReports = ref(false)
  const locationMapRef: Ref<Record<string, ILocation>> = ref({})
  const deadlines = ref({})

  const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
  const isRegisteringForm = computed(() => proposalStore.currentProposal?.type === ProposalType.RegisteringForm)

  const showPublicationsProposalStatus = [
    ProposalStatus.ExpectDataDelivery,
    ProposalStatus.DataResearch,
    ProposalStatus.DataCorrupt,
    ProposalStatus.FinishedProject,
    ProposalStatus.ReadyToArchive,
  ]

  const showDmsCommentStatus = [
    ProposalStatus.ExpectDataDelivery,
    ProposalStatus.DataResearch,
    ProposalStatus.DataCorrupt,
    ProposalStatus.FinishedProject,
    ProposalStatus.ReadyToArchive,
  ]

  const shouldDisplayDmsOverview = computed(() => showDmsCommentStatus.includes(status.value))
  const showDmsComments = computed(() => showDmsCommentStatus.includes(status.value))

  const possibleLocations = computed(() =>
    (proposalStore?.currentProposal?.userProject?.addressees?.desiredLocations ?? [])
      .map((locId) => locationMapRef.value?.[locId])
      .filter((loc) => loc),
  )

  const currentProjectAssignee = computed(() => proposalStore?.currentProposal?.projectAssignee ?? null)
  const selectedDataSources = computed(() => proposalStore?.currentProposal?.selectedDataSources ?? [])
  const owner = computed(() => proposalStore.currentProposal?.owner)
  const projectDuration = computed(
    () => proposalStore.currentProposal?.userProject.generalProjectInformation.projectDuration,
  )
  const numberOfRequestedInstitutions = computed(() => proposalStore.currentProposal?.numberOfRequestedLocations)

  const fdpgChecklist = computed(() => proposalStore.currentProposal?.fdpgChecklist ?? {})

  const messageBoxDefaults = {
    cancelButtonText: t('general.cancel'),
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
  }

  const {
    uploadsForType: documents,
    handleRemoveFile: handleDocumentRemove,
    isAppendixLoading: isDocumentsLoading,
  } = useUpload(
    proposalId,
    [
      DirectUpload.GeneralAppendix,
      DirectUpload.EthicVote,
      DirectUpload.EthicVoteDeclarationOfNonResponsibility,
      UseCaseUpload.FeasibilityQuery,
      UseCaseUpload.ProposalPDF,
    ],
    showErrorMessage,
  )

  const { downloadFile, isDownloadLoading } = useDraftDownload(proposalId, showErrorMessage)

  const handleExportProposalPdfClick = async () => {
    if (proposalId.value && !isDownloadLoading.value) {
      await downloadFile()
    }
  }

  const openLockModal = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: proposalStore.currentProposal?.isLocked ? 'proposal.unlockModalTitle' : 'proposal.lockModalTitle',
      message: proposalStore.currentProposal?.isLocked
        ? 'proposal.unlockModalDescription'
        : 'proposal.lockModalDescription',
      confirmButtonText: proposalStore.currentProposal?.isLocked ? 'proposal.unlockProposal' : 'proposal.lockProposal',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeLockingState(!proposalStore.currentProposal?.isLocked) : undefined,
    })
  }

  const changeLockingState = async (newLockingState: boolean) => {
    try {
      await proposalStore.updateLockingState(proposalId.value, newLockingState)
      showSuccessMessage(t('general.submitted'))
      await router.push({ name: layoutStore.lastDashboard })
    } catch (error: any) {
      showErrorMessage(t('general.failedSubmit'))
    }
  }

  const changeStatus = async (proposalStatus: ProposalStatus) => {
    try {
      await proposalStore.updateProposalStatus(proposalId.value, proposalStatus)
      showSuccessMessage(t('general.submitted'))
      await router.push({ name: layoutStore.lastDashboard })
    } catch (error: any) {
      showErrorMessage(t('general.failedSubmit'))
    }
  }

  const handleArchiveProjectClick = () => {
    messageBoxStore.setMessageBoxInfo({
      ...messageBoxDefaults,
      title: 'proposal.archiveProjectModalTitle',
      message: 'proposal.archiveProjectModalDescription',
      confirmButtonText: 'proposal.archiveProject',
      cancelButtonText: 'general.cancel',
      callback: async (decision: DecisionType) =>
        decision === 'confirm' ? await changeStatus(ProposalStatus.Archived) : undefined,
    })
  }

  watch(
    () => proposalStore.currentProposal as IProposal,
    () => {
      const proposalDeadlines = proposalStore.currentProposal?.deadlines || {}
      deadlines.value = Object.fromEntries(
        Object.keys(proposalDeadlines).map((key) => [
          key,
          (proposalStore.currentProposal?.deadlines as Record<string, string | null>)[key],
        ]),
      )
    },
    { deep: true },
  )

  const handleSaveDeadlines = async (newDeadlines: Deadlines) => {
    try {
      await proposalStore.updateDeadlines(proposalId.value, newDeadlines)
      showSuccessMessage()
    } catch (ex) {
      showErrorMessage()
    }
  }

  const updateQueue = new UpdateQueue()

  const updateChecklistItem = async (item: Partial<IFdpgChecklist>) => {
    if (!proposalId.value) {
      console.error('Proposal ID is missing')
      return
    }

    await updateQueue.update(item, async (item) => {
      try {
        await proposalStore.updateFdpgChecklistImmediate(proposalId.value, item)
        return Promise.resolve()
      } catch (error) {
        showErrorMessage('Failed to update checklist item')
        throw error
      }
    })
  }

  const onProjectAssigneeChange = async (newAssignee?: IProjectAssignee) => {
    try {
      await proposalStore.updateProjectAssignee(proposalId.value, newAssignee)
      await fetchProposal()
    } catch {
      showErrorMessage()
    }
  }

  const handleCohortEdit = async () => {
    await fetchProposal()
  }

  const addCohort = async (newCohort: ISelectedCohort, file: File) => {
    const _proposalId = proposalId.value
    if (_proposalId) {
      try {
        await proposalStore.uploadManualCohort(_proposalId, newCohort, file)
      } catch (e) {
        showErrorMessage(t('general.failedSubmit'))
      }
    }
    await handleCohortEdit()
  }

  const removeCohort = async (cohort: ISelectedCohort) => {
    const _proposalId = proposalId.value
    if (_proposalId && cohort._id) {
      try {
        await proposalStore.deleteCohort(_proposalId, cohort._id)
      } catch (e) {
        showErrorMessage()
      }
    }
    await handleCohortEdit()
  }

  const fetchProposal = async () => {
    try {
      const data = await proposalStore.setCurrentProposal(params.id as string)
      showPublicationsAndReports.value =
        (data.status ? showPublicationsProposalStatus.includes(data.status) : false) ||
        (data.status === 'ARCHIVED' && data.publications.length > 0)

      const lastDashboard = layoutStore.lastDashboard
      layoutStore.setBreadcrumbs([
        {
          name: lastDashboard,
          displayName: getLastDashboardTitle(lastDashboard),
        },
        {
          name: RouteName.ReviewProposal,
          params: data._id ? { id: data._id } : undefined,
          displayName: data.projectAbbreviation,
        },
      ])
    } catch (error) {
      showErrorMessage()
      await router.push({ name: RouteName.Dashboard })
      console.log(error)
    }
  }

  const openReviewPage = () => {
    if (isRegisteringForm.value) {
      router.push({ name: RouteName.EditRegisteredProject, params: { id: params.id } })
    } else {
      router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
    }
  }

  onMounted(async () => {
    await fetchProposal()
    const lm = await locationStore.getLocationLookupMap()
    locationMapRef.value = lm
  })

  const getLastDashboardTitle = (lastDashboard: string) => {
    return t(`sidebar.${lastDashboard}`)
  }

  return {
    // State
    proposalId,
    status,
    isRegisteringForm,
    isSubmitting,
    showPublicationsAndReports,
    documents,
    isDocumentsLoading,
    shouldDisplayDmsOverview,
    showDmsComments,
    possibleLocations,
    currentProjectAssignee,
    selectedDataSources,
    owner,
    projectDuration,
    numberOfRequestedInstitutions,
    fdpgChecklist,
    deadlines,
    locationMapRef,
    messageBoxDefaults,
    isDownloadLoading,

    // Enums & Constants
    CommentType,
    PlatformIdentifier,
    Role,

    // Methods
    openReviewPage,
    openLockModal,
    changeLockingState,
    changeStatus,
    handleArchiveProjectClick,
    handleSaveDeadlines,
    updateChecklistItem,
    onProjectAssigneeChange,
    addCohort,
    removeCohort,
    fetchProposal,
    handleDocumentRemove,
    handleExportProposalPdfClick,

    // Stores
    proposalStore,
    authStore,

    // Utils
    t,
    showErrorMessage,
    showSuccessMessage,
  }
}

function getLastDashboardTitle(lastDashboard: string) {
  return lastDashboard
}
