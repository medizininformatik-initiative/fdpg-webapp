<template>
  <el-container v-if="proposalStore.currentProposal" class="fdpg-member-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>

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

    <FdpgProjectAssignee
      v-model="currentProjectAssignee"
      :current-user-role="authStore.singleKnownRole ?? Role.DataSourceMember"
      :data-sources="selectedDataSources"
      @update:model-value="onProjectAssigneeChange"
    />

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
  </el-container>
</template>

<script setup lang="ts">
import DetailActionRow from '@/components/DetailActionRow.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectReports from '@/components/ProjectReports.vue'
import DocumentList from './DocumentList.vue'
import ProjectHistory from './ProjectHistory.vue'
import FdpgCheckNotes from '@/components/FdpgCheckNotes.vue'
import FdpgProjectAssignee from '@/components/FdpgProjectAssignee.vue'
import { computed } from 'vue'
import type { IButtonConfig } from '@/types/button-config.interface'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { ProposalStatus } from '@/types/proposal.types'
import { useFdpgProposalCommon } from '@/composables/use-fdpg-proposal-common'
import { useFdpgRegisteringForm } from '@/composables/use-fdpg-registering-form'

const {
  proposalId,
  status,
  showPublicationsAndReports,
  documents,
  isDocumentsLoading,
  showDmsComments,
  possibleLocations,
  currentProjectAssignee,
  selectedDataSources,
  owner,
  projectDuration,
  numberOfRequestedInstitutions,
  isDownloadLoading,
  CommentType,
  Role,
  openReviewPage,
  openLockModal,
  changeStatus,
  onProjectAssigneeChange,
  handleDocumentRemove,
  handleExportProposalPdfClick,
  proposalStore,
  authStore,
  t,
  showErrorMessage,
} = useFdpgProposalCommon()

const {
  isSyncing,
  shouldShowSyncButton,
  syncDisabledReason,
  syncButtonLabel,
  handleSyncProposalClick,
  handleAcceptProposalClick,
  handleRequestRevisionClick,
} = useFdpgRegisteringForm(proposalId, changeStatus, showErrorMessage)

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
])

const actionButtons = computed<IDetailActionRow[]>(() => [
  {
    type: 'primary',
    label: 'proposal.acceptProposalToPublish',
    action: handleAcceptProposalClick,
    testId: 'button__acceptProposal',
    position: 'right',
    isHidden: status.value !== ProposalStatus.FdpgCheck,
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
  {
    type: 'primary',
    label: syncButtonLabel.value as any,
    testId: 'button__syncToWebsite',
    action: handleSyncProposalClick,
    position: 'right',
    isHidden: !shouldShowSyncButton.value,
    isDisabled: isSyncing.value || proposalStore.currentProposal?.isLocked,
    isLoading: isSyncing.value,
    tooltip: syncDisabledReason.value || undefined,
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
