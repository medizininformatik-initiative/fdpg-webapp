<template>
  <el-container class="researcher-registering-form-details-page" v-if="proposalStore.currentProposal">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>

    <ProjectPublications
      v-if="showPublicationsAndReports"
      :is-disabled="proposalStore.currentProposal?.isLocked"
      access-for-maintenance
    ></ProjectPublications>
    <ProjectReports
      v-if="showPublicationsAndReports"
      :is-disabled="proposalStore.currentProposal?.isLocked"
      access-for-maintenance
    ></ProjectReports>

    <ProjectHistory />

    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_OWNER" :possible-locations="possibleLocations" />
  </el-container>
</template>

<script setup lang="ts">
import AppendixInfo from '@/components/AppendixInfo.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectReports from '@/components/ProjectReports.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectHistory from '@/components/Proposals/Details/ProjectHistory.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import useNotifications from '@/composables/use-notifications'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import { ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import useDraftDownload from '@/composables/use-draft-download'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'

const { t } = useI18n()
const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const router = useRouter()

const currentProposalStatus = [ProposalStatus.ReadyToArchive, ProposalStatus.Published]

const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const messageBoxStore = useMessageBoxStore()

const locationMapRef: Ref<Record<string, ILocation>> = ref({})

const possibleLocations = computed(() =>
  (proposalStore?.currentProposal?.userProject?.addressees?.desiredLocations ?? [])
    .map((locId) => locationMapRef.value?.[locId])
    .filter((loc) => loc),
)

const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)

const { showErrorMessage, showSuccessMessage } = useNotifications()

const openReviewPage = () => {
  router.push({ name: RouteName.EditRegisteredProject, params: { id: proposalId.value } })
}

const { downloadFile, isDownloadLoading } = useDraftDownload(proposalId, showErrorMessage)

const handleExportProposalPdfClick = async () => {
  if (proposalId.value && !isDownloadLoading.value) {
    await downloadFile()
  }
}

const showPublicationsAndReports = ref(false)

const projectDuration = computed(
  () => proposalStore.currentProposal?.userProject?.generalProjectInformation?.projectDuration,
)
const numberOfRequestedInstitutions = computed(() => proposalStore.currentProposal?.numberOfRequestedLocations)
const ownerEmail = computed(() => proposalStore.currentProposal?.owner?.email)

const quickInfo = computed<IQuickInfo[]>(() => [
  {
    icon: 'bi-graph-up',
    label: t('proposal.projectDuration'),
    values: [projectDuration.value || '-'],
  },
  {
    icon: 'bi-people-fill',
    label: t('proposal.numberOfRequestedInstitutions'),
    values: [numberOfRequestedInstitutions.value?.toString() || '-'],
  },
  {
    icon: 'bi-person-fill',
    label: t('general.applicant'),
    values: [proposalStore.currentProposal?.ownerName || '-'],
  },
  {
    icon: 'bi-envelope-fill',
    label: t('general.applicantEmail'),
    values: [ownerEmail.value || '-'],
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
    isDisabled: proposalStore.currentProposal?.isLocked,
  },
])

const getSyncStatusType = (syncStatus?: string) => {
  switch (syncStatus) {
    case 'SYNCED':
      return 'success'
    case 'PENDING':
      return 'warning'
    case 'FAILED':
      return 'danger'
    default:
      return 'info'
  }
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
        name: RouteName.ProposalDetails,
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
const handleArchiveProjectClick = () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.archiveProjectModalTitle',
    message: 'proposal.archiveProjectModalDescription',
    confirmButtonText: 'proposal.archiveProject',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.Archived) : undefined,
  })
}
const changeStatus = async (proposalStatus: ProposalStatus) => {
  try {
    await proposalStore.updateProposalStatus(proposalId.value, proposalStatus)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: RouteName.Dashboard })
  } catch (error: any) {
    showErrorMessage(t('general.failedSubmit'))
  }
}

onMounted(async () => {
  await fetchProposal()

  const lm = await locationStore.getLocationLookupMap()
  locationMapRef.value = lm
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.researcher-registering-form-details-page {
  flex-direction: column;

  .section {
    margin-bottom: 32px;
    padding: 24px;
    background-color: $gray-100;
    border-radius: 8px;

    .section-title {
      margin-bottom: 22px;
      font-size: 18px;
      font-weight: 600;
      color: $gray-900;
    }
  }
}
</style>
