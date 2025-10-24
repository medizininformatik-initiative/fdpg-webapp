<template>
  <el-container v-if="proposalStore.currentProposal" class="fdpg-member-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ProjectTodos :project-todos="projectTodos"></ProjectTodos>

    <ContractParticipants v-if="showContractingParticipants" />
    <LocationVotePanel v-if="showLocationVotePanel" />
    <ParticipatingResearcher v-if="proposalId"></ParticipatingResearcher>

    <FdpgChangeDeadlines
      :deadlines="deadlines"
      :status="status"
      @saveDeadlines="handleSaveDeadlines"
    ></FdpgChangeDeadlines>

    <ProjectPublications v-if="showPublicationsAndReports"></ProjectPublications>
    <ProjectReports v-if="showPublicationsAndReports"></ProjectReports>
    <div class="section">
      <h3 info="general.info" size="large">{{ t('proposal.checkAttachments', { count: documents.length }) }}</h3>
      <DocumentList
        :documents="documents"
        :proposal-id="proposalId"
        :is-loading="isDocumentsLoading"
        :is-disabled="true"
        :two-columns="true"
        empty-alert-text="proposal.noAttachmentsYet"
        @remove="handleDocumentRemove"
      />
    </div>

    <ReviewMemberCohortSelection
      v-if="proposalStore.currentProposal?.selectedDataSources?.includes?.(PlatformIdentifier.Mii)"
      v-model="proposalStore.currentProposal.userProject.cohorts.selectedCohorts"
      :enable-edit="
        [ProposalStatus.Draft, ProposalStatus.Rework, ProposalStatus.FdpgCheck, ProposalStatus.LocationCheck].includes(
          status,
        )
      "
      @add-cohort="addCohort"
      @remove-cohort="removeCohort"
    />

    <FdpgCheckList
      v-model="fdpgChecklist"
      :status="status"
      :checklist="proposalStore.currentProposal.fdpgChecklist"
      title="proposal.checklistVerification"
      @update:listItem="(event: Partial<IFdpgChecklist>) => updateChecklistItem(event)"
    ></FdpgCheckList>
    <DetailActionRow :buttons="actionButtons"></DetailActionRow>
    <ProjectHistory />

    <div class="divider" />
    <FdpgCheckNotes
      v-if="status === ProposalStatus.FdpgCheck || proposalStore.currentProposal?.fdpgCheckNotes"
    ></FdpgCheckNotes>
    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_OWNER"></MessageCenter>
    <MessageCenter
      v-if="proposalStore.currentProposal?.status !== ProposalStatus.Draft"
      :type="CommentType.PROPOSAL_MESSAGE_TO_LOCATION"
    ></MessageCenter>

    <InitiateContractDialog
      v-model="isInitiateContractDialogOpen"
      :locations="uacLocations"
      :isSubmitting="isSubmitting"
      @initiate-contract="handleContractSignConfirm"
    />
  </el-container>
</template>

<script setup lang="ts">
import AppendixInfo from '@/components/AppendixInfo.vue'
import ContractParticipants from '@/components/ContractParticipants.vue'
import DetailActionRow from '@/components/DetailActionRow.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import FdpgCheckList from '@/components/FdpgCheckList.vue'
import InitiateContractDialog from '@/components/InitiateContractDialog.vue'
import LocationVotePanel from '@/components/LocationVotePanel.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectTodos from '@/components/ProjectTodos.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectReports from '@/components/ProjectReports.vue'
import useNotifications from '@/composables/use-notifications'
import useUpload from '@/composables/use-upload'
import useDraftDownload from '@/composables/use-draft-download'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { IChecklistItem, IFdpgChecklist, IProposal, ISelectedCohort, IUpload } from '@/types/proposal.types'
import { ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import type { UploadFile } from 'element-plus'
import { ElContainer } from 'element-plus'
import { computed, defineComponent, onMounted, reactive, ref, markRaw, nextTick, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ParticipatingResearcher from '../../ParticipatingResearcher.vue'
import DocumentList from './DocumentList.vue'
import ProjectHistory from './ProjectHistory.vue'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import type { MiiLocation } from '@/types/location.enum'
import FdpgChangeDeadlines from '@/components/FdpgChangeDeadlines.vue'
import type { Deadlines, DueDateEnum } from '@/types/due-date.enum'
import { statusToDueDatesMap } from '@/utils/deadlines'
import ReviewMemberCohortSelection from '@/pages/Proposals/Casesohort/ReviewMemberCohortSelection.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { UpdateQueue } from '@/utils/promise-queue.util'

const messageBoxStore = useMessageBoxStore()
const authStore = useAuthStore()
const { t } = useI18n()
const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const router = useRouter()
const showPublicationsAndReports = ref(false)
const currentProposalStatus = [
  ProposalStatus.ExpectDataDelivery,
  ProposalStatus.DataResearch,
  ProposalStatus.DataCorrupt,
  ProposalStatus.FinishedProject,
  ProposalStatus.ReadyToArchive,
]

const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()
const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
const isSubmitting = ref(false)
const isRegisteringForm = computed(() => proposalStore.currentProposal?.register?.isRegisteringForm || false)

const openReviewPage = () => {
  if (isRegisteringForm.value) {
    router.push({ name: RouteName.RegisterProject, params: { id: params.id } })
  } else {
    router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
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

const isInitiateContractDialogOpen = ref(false)

const handleToContractingClick = () => {
  isInitiateContractDialogOpen.value = true
}

const deadlines = ref({})

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

const handleContractSignConfirm = async (file: UploadFile, selectedLocations: MiiLocation[]) => {
  isSubmitting.value = true
  await initContracting(selectedLocations, file?.raw)
  isSubmitting.value = false
}

const initContracting = async (selectedLocations: MiiLocation[], file?: File) => {
  if (!file) {
    showErrorMessage(t('general.failedSubmit'))
    return
  }

  try {
    await proposalStore.initContracting(proposalId.value, file, selectedLocations)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: layoutStore.lastDashboard })
  } catch (error: any) {
    showErrorMessage(t('general.failedSubmit'))
  }
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

const messageBoxDefaults = {
  cancelButtonText: t('general.cancel'),
  cancelButtonClass: 'el-button--text',
  showCancelButton: true,
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

const handleAcceptProposalClick = () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.acceptProposalModalTitle',
    message: 'proposal.acceptProposalModalDescription',
    confirmButtonText: 'proposal.acceptProposal',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.ReadyToPublish) : undefined,
  })
}
const handleRegisterProjectClick = async () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.registerProjectModalTitle',
    message: 'proposal.registerProjectModalDescription',
    confirmButtonText: 'proposal.registerProject',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) => {
      if (decision === 'confirm') {
        try {
          isSubmitting.value = true

          const copyId = await proposalStore.copyAsInternalRegistration(proposalId.value)

          showSuccessMessage('proposal.projectCopiedForRegistration')

          // Navigate to register/edit route with the new copy ID
          router.push({
            name: RouteName.RegisterProject,
            params: { id: copyId },
          })
        } catch (error: any) {
          showErrorMessage(error?.message || error?.toString() || 'general.genericError')
        } finally {
          isSubmitting.value = false
        }
      }
    },
  })
}
const handleToLocationCheckClick = () => {
  const messageComponent = markRaw(
    defineComponent({
      setup(props) {
        return {}
      },
      template: `<h4>{{$t('proposal.listOfNoMarked')}}:</h4><ul v-if="listOfNoMarked"><li v-for="(item, i) in listOfNoMarked" :key="i">{{$t('proposal.' + item)}}</li></ul>`,
      props: {
        listOfNoMarked: {
          type: Array,
          required: true,
        },
      },
    }),
  )
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.toLocationCheckModalTitle',
    message: 'proposal.toLocationCheckModalDescription',
    confirmButtonText: 'proposal.toLocationCheck',
    cancelButtonText: 'general.cancel',
    messageComponent,
    messageComponentProps: {
      listOfNoMarked:
        proposalStore.currentProposal?.fdpgChecklist?.checkListVerification?.reduce(
          (acc: string[], item: IChecklistItem) => {
            if (item.answer.some((a) => a === 'no')) {
              acc.push(item.questionKey)
            }
            if (item.sublist && item.sublist.length > 0) {
              item.sublist.forEach((subItem) => {
                if (subItem.answer.some((a) => a === 'no')) {
                  acc.push(subItem.questionKey)
                }
              })
            }
            return acc
          },
          [],
        ) || [],
    },
    callback: async (decision: DecisionType) => {
      if (decision === 'confirm') {
        await changeStatus(ProposalStatus.LocationCheck)
      }
      //clean up messageBoxStore
      messageBoxStore.$patch({
        messageComponent: undefined,
        messageComponentProps: {},
      })
    },
  })
}

const handleToExpectDataDeliveryClick = () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.toExpectDataDeliveryModalTitle',
    message: 'proposal.toExpectDataDeliveryModalDescription',
    confirmButtonText: 'proposal.toExpectDataDelivery',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.ExpectDataDelivery) : undefined,
  })
}

const handleFinishProjectClick = () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.toReadyToArchiveModalTitle',
    message: 'proposal.toReadyToArchiveModalDescription',
    confirmButtonText: 'proposal.finishProject',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.ReadyToArchive) : undefined,
  })
}

const handleFinishProjectDeclineClick = () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.declineToReadyToArchiveModalTitle',
    message: 'proposal.declineToReadyToArchiveModalDescription',
    confirmButtonText: 'proposal.finishProjectDecline',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.DataResearch) : undefined,
  })
}

const handleDownloadLocationCsvClick = async () => {
  if (proposalId.value) {
    await proposalStore.downloadLocationCsv(proposalId.value)
  }
}

const { downloadFile, isDownloadLoading } = useDraftDownload(proposalId, showErrorMessage)

const handleExportProposalPdfClick = async () => {
  if (proposalId.value && !isDownloadLoading.value) {
    await downloadFile()
  }
}

const getIsCheckedTodo = (proposalStatus: ProposalStatus): IProjectTodo[] => {
  if (proposalStatus === ProposalStatus.FdpgCheck) {
    const isDoneCount = proposalStore.currentProposal?.isDoneOverview?.isDoneCount
    const fieldCount = proposalStore.currentProposal?.isDoneOverview?.fieldCount
    return [
      {
        title: t('proposal.checkedAreas', {
          isDoneCount,
          fieldCount,
        }),
        description: t('proposal.checkedAreasDescription'),
        action: () => {},
        isDone: isDoneCount !== undefined && isDoneCount === fieldCount,
        type: 'info',
        icon: 'bi bi-check-circle',
        readonly: false,
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return getIsCheckedTodo(status.value)
})

const projectDuration = computed(
  () => proposalStore.currentProposal?.userProject.generalProjectInformation.projectDuration,
)
const numberOfRequestedInstitutions = computed(() => proposalStore.currentProposal?.numberOfRequestedLocations)
const owner = computed(() => proposalStore.currentProposal?.owner)
const uacFullyApproved = computed(() => {
  const conditionAccepted =
    proposalStore.currentProposal?.conditionalApprovals.filter(
      (condition) =>
        condition.isAccepted &&
        !proposalStore.currentProposal?.requestedButExcludedLocations.includes(condition.location),
    ) ?? []
  const uacApprovals =
    proposalStore.currentProposal?.uacApprovals.filter(
      (approval) => !proposalStore.currentProposal?.requestedButExcludedLocations.includes(approval.location),
    ) ?? []
  return [...uacApprovals, ...conditionAccepted]
})

const uacLocations = computed(() => uacFullyApproved.value.map((a) => a.location))

const quickInfo = computed<IQuickInfo[]>(() => [
  {
    icon: 'bi-graph-up',
    label: t('proposal.projectDuration'),
    values: [projectDuration.value || '-'],
  },
  {
    icon: 'bi-people-fill',
    label: t('proposal.numberOfRequestedInstitutions'),
    values: [numberOfRequestedInstitutions.value || '-'],
  },
  {
    icon: 'bi-person-fill',
    label: t('general.applicant'),
    values: [proposalStore.currentProposal?.ownerName || '-'],
  },
  {
    icon: 'bi-envelope-fill',
    label: t('general.applicantEmail'),
    values: [owner.value?.email || '-'],
  },
])

const topBarButtons = computed<IButtonConfig[]>(() => [
  {
    label: 'proposal.exportAttachments',
    testId: 'button__exportAttachments',
    isHidden: !proposalId.value || proposalStore.currentProposal?.uploads?.length === 0,
    action: async () => {
      if (proposalId.value) {
        try {
          await proposalStore.exportAllUploadsAsZip()
        } catch (error: any) {
          showErrorMessage(error.message)
        }
      }
    },
  },
  {
    label: 'proposal.exportPdfProposal',
    testId: 'button__exportPdf',
    action: () => handleExportProposalPdfClick(),
    isLoading: isDownloadLoading.value,
    isHidden: !(
      status.value === ProposalStatus.Draft ||
      status.value === ProposalStatus.FdpgCheck ||
      status.value === ProposalStatus.Rework
    ),
  },
  {
    type: proposalStore.currentProposal?.isLocked ? 'success' : 'danger',
    label: proposalStore.currentProposal?.isLocked ? 'proposal.unlockProposal' : 'proposal.lockProposal',
    testId: 'button__lockOrUnlockProposal',
    action: openLockModal,
    isHidden:
      !authStore.hasFdpgLevelPermissions() ||
      (authStore.hasFdpgLevelPermissions() && proposalStore.currentProposal?.status === ProposalStatus.Draft),
  },
  {
    type: 'primary',
    label: 'proposal.toTheRequest',
    testId: 'button__toProposal',
    action: openReviewPage,
  },

  {
    type: 'primary',
    label: 'proposal.archiveProject',
    testId: 'button__archiveProposal',
    action: handleArchiveProjectClick,
    isHidden: !(status.value === ProposalStatus.Rejected || status.value === ProposalStatus.ReadyToArchive),
  },
])

const actionButtons = computed<IDetailActionRow[]>(() => [
  {
    label: 'proposal.rejectApplication',
    testId: 'button__rejectProposal',
    action: handleRejectApplicationClick,
    position: 'left',
    isDisabled: proposalStore.currentProposal?.isLocked,
    isHidden: !(
      status.value === ProposalStatus.FdpgCheck ||
      status.value === ProposalStatus.LocationCheck ||
      status.value === ProposalStatus.Contracting ||
      status.value === ProposalStatus.Rework
    ),
  },
  {
    label: 'proposal.requestRevision',
    testId: 'button__requestRevision',
    action: handleRequestRevisionClick,
    position: 'left',
    isDisabled: proposalStore.currentProposal?.isLocked,
    isHidden: status.value !== ProposalStatus.FdpgCheck,
  },
  {
    type: 'primary',
    label: 'proposal.acceptProposalToPublish',
    action: handleAcceptProposalClick,
    testId: 'button__acceptProposal',
    position: 'right',
    isHidden: !(status.value === ProposalStatus.FdpgCheck && isRegisteringForm.value),
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.registerProject',
    action: handleRegisterProjectClick,
    testId: 'button__registerProject',
    position: 'right',
    isHidden:
      isRegisteringForm.value ||
      ![
        ProposalStatus.Contracting,
        ProposalStatus.ExpectDataDelivery,
        ProposalStatus.DataResearch,
        ProposalStatus.DataCorrupt,
        ProposalStatus.FinishedProject,
      ].includes(status.value),
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.toLocationCheck',
    action: handleToLocationCheckClick,
    testId: 'button__toLocationCheck',
    position: 'right',
    isHidden: status.value !== ProposalStatus.FdpgCheck,
    isDisabled: proposalStore.currentProposal?.isLocked || !isChecklistDone.value,
  },
  {
    label: 'proposal.downloadLocationCsv',
    testId: 'button__downloadLocationCsv',
    action: handleDownloadLocationCsvClick,
    position: 'right',
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.initiateContract',
    testId: 'button__initiateContract',
    action: handleToContractingClick,
    position: 'right',
    isHidden: status.value !== ProposalStatus.LocationCheck,
    isDisabled: uacFullyApproved.value.length <= 0 || proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.toExpectDataDelivery',
    testId: 'button__toExpectDataDelivery',
    action: handleToExpectDataDeliveryClick,
    position: 'right',
    isHidden: status.value !== ProposalStatus.Contracting,
    isDisabled:
      (proposalStore.currentProposal ? proposalStore.currentProposal?.signedContracts?.length <= 0 : true) ||
      proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.finishProject',
    testId: 'button__finishProject',
    action: handleFinishProjectClick,
    position: 'right',
    isDisabled: proposalStore.currentProposal?.isLocked,
    isHidden: status.value !== ProposalStatus.DataResearch,
  },
  {
    label: 'proposal.finishProjectDecline',
    testId: 'button__finishProjectDecline',
    action: handleFinishProjectDeclineClick,
    position: 'left',
    isDisabled: proposalStore.currentProposal?.isLocked,
    isHidden: status.value !== ProposalStatus.FinishedProject,
  },
])

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

const fdpgChecklist = computed(() => proposalStore.currentProposal?.fdpgChecklist ?? {})

const showContractingParticipants = computed(() => {
  return (
    status.value === ProposalStatus.Contracting ||
    status.value === ProposalStatus.ExpectDataDelivery ||
    status.value === ProposalStatus.DataResearch ||
    status.value === ProposalStatus.DataCorrupt ||
    status.value === ProposalStatus.ReadyToArchive ||
    status.value === ProposalStatus.FinishedProject ||
    status.value === ProposalStatus.Archived ||
    status.value === ProposalStatus.Rejected
  )
})

const showLocationVotePanel = computed(() => {
  return status.value === ProposalStatus.LocationCheck || showContractingParticipants.value
})

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
      (data.status ? currentProposalStatus.includes(data.status) : false) ||
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
const handleSaveDeadlines = async (deadlines: Deadlines) => {
  try {
    await proposalStore.updateDeadlines(proposalId.value, deadlines)
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

onUnmounted(() => {
  updateQueue.clear()
})

const isChecklistDone = computed(() => {
  const checklist = proposalStore.currentProposal?.fdpgChecklist
  if (!checklist) return false

  const verification = checklist.checkListVerification
  if (!verification || !Array.isArray(verification)) return false

  const projectProperties = checklist.projectProperties
  if (!projectProperties || !Array.isArray(projectProperties)) return false

  return (
    verification.every((item: IChecklistItem) => item.isAnswered) &&
    checklist.isRegistrationLinkSent &&
    projectProperties.every((item: IChecklistItem) => item.isAnswered)
  )
})

onMounted(async () => {
  await fetchProposal()
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.fdpg-member-details-page {
  flex-direction: column;

  .section {
    margin-bottom: 32px;

    .section-title {
      margin-bottom: 22px;
    }
  }

  .divider {
    border-top: 1px solid $gray-700;
    margin-top: 27px;
    margin-bottom: 52px;
  }
}
</style>
