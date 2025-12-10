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

    <FdpgProjectAssignee
      v-model="currentProjectAssignee"
      :current-user-role="authStore.singleKnownRole ?? Role.DataSourceMember"
      :data-sources="selectedDataSources"
      @update:model-value="onProjectAssigneeChange"
    />

    <FdpgCheckList
      v-model="fdpgChecklist"
      :status="status"
      :checklist="proposalStore.currentProposal.fdpgChecklist"
      title="proposal.checklistVerification"
      @update:listItem="(event: Partial<IFdpgChecklist>) => updateChecklistItem(event)"
    ></FdpgCheckList>
    <ProjectDMSOverview v-if="shouldDisplayDmsOverview" />
    <DetailActionRow :buttons="actionButtons"></DetailActionRow>
    <ProjectHistory />

    <div class="divider" />

    <FdpgCheckNotes
      v-if="status === ProposalStatus.FdpgCheck || proposalStore.currentProposal?.fdpgCheckNotes"
    ></FdpgCheckNotes>

    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_OWNER" :possible-locations="possibleLocations" />
    <MessageCenter
      v-if="showDmsComments"
      :type="CommentType.PROPOSAL_MESSAGE_TO_DMST"
      :possible-locations="possibleLocations"
    />
    <MessageCenter
      v-if="proposalStore.currentProposal?.status !== ProposalStatus.Draft"
      :type="CommentType.PROPOSAL_MESSAGE_TO_LOCATION"
      :possible-locations="possibleLocations"
    />

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
import ParticipatingResearcher from '../../ParticipatingResearcher.vue'
import DocumentList from './DocumentList.vue'
import ProjectHistory from './ProjectHistory.vue'
import ReviewMemberCohortSelection from '@/pages/Proposals/Casesohort/ReviewMemberCohortSelection.vue'
import FdpgCheckNotes from '@/components/FdpgCheckNotes.vue'
import ProjectDMSOverview from '@/components/DataDelivery/ProjectDMSOverview.vue'
import FdpgProjectAssignee from '@/components/FdpgProjectAssignee.vue'
import FdpgChangeDeadlines from '@/components/FdpgChangeDeadlines.vue'
import { computed } from 'vue'
import type { IButtonConfig } from '@/types/button-config.interface'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import type { IQuickInfo } from '@/types/quick-info.interface'
import type { IFdpgChecklist } from '@/types/proposal.types'
import { DeliveryInfoStatus, ProposalStatus } from '@/types/proposal.types'
import { useFdpgProposalCommon } from '@/composables/use-fdpg-proposal-common'
import { useFdpgApplicationForm } from '@/composables/use-fdpg-application-form'

// Common functionality
const {
  proposalId,
  status,
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
  isDownloadLoading,
  CommentType,
  PlatformIdentifier,
  Role,
  openReviewPage,
  openLockModal,
  changeStatus,
  handleArchiveProjectClick,
  handleSaveDeadlines,
  updateChecklistItem,
  onProjectAssigneeChange,
  addCohort,
  removeCohort,
  handleDocumentRemove,
  handleExportProposalPdfClick,
  proposalStore,
  authStore,
  t,
  showErrorMessage,
} = useFdpgProposalCommon()

// Application Form specific functionality
const {
  isInitiateContractDialogOpen,
  uacFullyApproved,
  uacLocations,
  showContractingParticipants,
  showLocationVotePanel,
  isChecklistDone,
  handleRequestRevisionClick,
  handleRejectApplicationClick,
  handleToLocationCheckClick,
  handleToContractingClick,
  handleToExpectDataDeliveryClick,
  handleFinishProjectClick,
  handleFinishProjectDeclineClick,
  handleDownloadLocationCsvClick,
  handleContractSignConfirm,
  handleRegisterProjectClick,
  handleStartAnalysisClick,
  handleFinishAnalysisClick,
} = useFdpgApplicationForm(proposalId, status, changeStatus, t, t)

// Project Todos
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

// Quick Info
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

// Top Bar Buttons
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

// Action Buttons
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
    isHidden: [
      ProposalStatus.ExpectDataDelivery,
      ProposalStatus.DataResearch,
      ProposalStatus.DataResearchFinished,
      ProposalStatus.FinishedProject,
    ].includes(status.value),
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.startAnalysis',
    testId: 'button__startAnalysis',
    action: handleStartAnalysisClick,
    position: 'right',
    isHidden: status.value !== ProposalStatus.ExpectDataDelivery,
    isDisabled:
      proposalStore.currentProposal?.isLocked ||
      !proposalStore.currentProposal?.dataDelivery?.deliveryInfos.some((deliveryInfo) =>
        [DeliveryInfoStatus.FETCHED_BY_RESEARCHER, DeliveryInfoStatus.RESULTS_AVAILABLE].includes(deliveryInfo.status),
      ),
  },
  {
    type: 'primary',
    label: 'proposal.finishAnalysis',
    testId: 'button__finishAnalysis',
    action: handleFinishAnalysisClick,
    position: 'right',
    isHidden: proposalStore.currentProposal?.status !== ProposalStatus.DataResearch,
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: 'proposal.registerProject',
    action: handleRegisterProjectClick,
    testId: 'button__registerProject',
    position: 'right',
    isHidden:
      ![
        ProposalStatus.Contracting,
        ProposalStatus.ExpectDataDelivery,
        ProposalStatus.DataResearch,
        ProposalStatus.DataCorrupt,
        ProposalStatus.FinishedProject,
      ].includes(status.value) || proposalStore.currentProposal?.registerFormId !== undefined,
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
