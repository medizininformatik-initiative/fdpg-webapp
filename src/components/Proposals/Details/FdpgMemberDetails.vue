<template>
  <el-container v-if="proposalStore.currentProposal" class="fdpg-member-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>

    <ContractParticipants v-if="showContractingParticipants" />
    <LocationVotePanel v-if="showLocationVotePanel" />
    <ParticipatingResearcher v-if="proposalId"></ParticipatingResearcher>
    <ProjectTodos :project-todos="projectTodos"></ProjectTodos>
    <ProjectPublications v-if="showPublicationsAndReports"></ProjectPublications>
    <ProjectReports v-if="showPublicationsAndReports"></ProjectReports>
    <div v-if="status === ProposalStatus.FdpgCheck" class="section">
      <h3 info="general.info" size="large">{{ $t('proposal.checkAttachments', { count: documents.length }) }}</h3>
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

    <FdpgCheckList
      v-if="status === ProposalStatus.FdpgCheck"
      v-model="fdpgChecklist"
      :checklist-options="checklistOptions"
      :is-disabled="proposalStore.currentProposal.isLocked"
      title="proposal.checklistVerification"
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
import type { TranslationSchema } from '@/plugins/i18n'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { IFdpgChecklist } from '@/types/proposal.types'
import { ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import { DirectUpload } from '@/types/upload.types'
import type { UploadFile } from 'element-plus'
import { ElContainer } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ParticipatingResearcher from '../../ParticipatingResearcher.vue'
import DocumentList from './DocumentList.vue'
import ProjectHistory from './ProjectHistory.vue'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import type { MiiLocation } from '@/types/location.enum'

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

const openReviewPage = () => {
  router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
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

const handleContractSignConfirm = async (file: UploadFile, selectedLocations: MiiLocation[]) => {
  await initContracting(file?.raw, selectedLocations)
}

const initContracting = async (file: File, selectedLocations: MiiLocation[]) => {
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

const handleToLocationCheckClick = () => {
  messageBoxStore.setMessageBoxInfo({
    ...messageBoxDefaults,
    title: 'proposal.toLocationCheckModalTitle',
    message: 'proposal.toLocationCheckModalDescription',
    confirmButtonText: 'proposal.toLocationCheck',
    cancelButtonText: 'general.cancel',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.LocationCheck) : undefined,
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

const handleExportProposalPdfClick = () => {
  proposalStore.getProposalFile(proposalId.value)
}

const getIsUniqueTodo = (proposalStatus: ProposalStatus): IProjectTodo[] => {
  if (proposalStatus === ProposalStatus.FdpgCheck) {
    return [
      {
        title: t('proposal.checkProjectForUniqueness'),
        description: t('proposal.uniquenessGivenDescription'),
        action: () => {},
        type: 'info',
        isDone: isChecklistDone.value,
      },
    ]
  } else {
    return []
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
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return [...getIsUniqueTodo(status.value), ...getIsCheckedTodo(status.value)]
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
    type: 'secondary',
    label: 'proposal.exportPdfProposal',
    testId: 'button__exportPdf',
    action: () => handleExportProposalPdfClick(),
    isHidden: !(status.value === ProposalStatus.Draft || status.value === ProposalStatus.FdpgCheck),
  },
  {
    type: proposalStore.currentProposal?.isLocked ? 'success' : 'danger',
    label: proposalStore.currentProposal?.isLocked ? 'proposal.unlockProposal' : 'proposal.lockProposal',
    testId: 'button__lockOrUnlockProposal',
    action: openLockModal,
    isHidden:
      authStore.singleKnownRole !== Role.FdpgMember ||
      (authStore.singleKnownRole === Role.FdpgMember && proposalStore.currentProposal?.status === ProposalStatus.Draft),
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
    type: 'secondary',
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
    type: 'secondary',
    label: 'proposal.requestRevision',
    testId: 'button__requestRevision',
    action: handleRequestRevisionClick,
    position: 'left',
    isDisabled: proposalStore.currentProposal?.isLocked,
    isHidden: status.value !== ProposalStatus.FdpgCheck,
  },
  {
    type: 'primary',
    label: 'proposal.toLocationCheck',
    action: handleToLocationCheckClick,
    testId: 'button__toLocationCheck',
    position: 'right',
    isHidden: status.value !== ProposalStatus.FdpgCheck,
    isDisabled: !isChecklistDone.value || proposalStore.currentProposal?.isLocked,
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
    type: 'secondary',
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
  [DirectUpload.GeneralAppendix, DirectUpload.EthicVote, DirectUpload.EthicVoteDeclarationOfNonResponsibility],
  showErrorMessage,
)

const fdpgChecklist = computed({
  get() {
    return proposalStore.currentProposal?.fdpgChecklist ?? {}
  },
  set(checkList: IFdpgChecklist) {
    if (proposalStore.currentProposal) {
      const errorCb = (_error: any) => {
        showErrorMessage(t('proposal.checklistGenericError'))
      }
      proposalStore.updateFdpgChecklist(proposalId.value, checkList, errorCb)
    }
  },
})

const checklistOptions: Record<keyof IFdpgChecklist, TranslationSchema> = {
  isRegistrationLinkSent: 'proposal.isRegistrationLinkSentLabel',
  isUnique: 'proposal.isUniqueLabel',
  isAttachmentsChecked: 'proposal.isAttachmentsCheckedLabel',
  isChecked: 'proposal.isCheckedLabel',
}

const isChecklistDone = computed(() => {
  const checked = Object.values(proposalStore.currentProposal?.fdpgChecklist ?? {}).filter((value) => value).length
  return checked === Object.keys(checklistOptions).length
})

const showContractingParticipants = computed(() => {
  return (
    status.value === ProposalStatus.Contracting ||
    status.value === ProposalStatus.ExpectDataDelivery ||
    status.value === ProposalStatus.DataResearch ||
    status.value === ProposalStatus.DataCorrupt
  )
})

const showLocationVotePanel = computed(() => {
  return status.value === ProposalStatus.LocationCheck || showContractingParticipants.value
})

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

onMounted(async () => {
  await fetchProposal()
})
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

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
