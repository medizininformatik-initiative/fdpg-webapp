<template>
  <el-container class="uac-proposal-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ReviewMemberCohortSelection
      v-if="proposalStore.currentProposal?.selectedDataSources?.includes?.(PlatformIdentifier.Mii)"
      v-model="proposalStore.currentProposal.userProject.cohorts.selectedCohorts"
      :enable-edit="false"
      @add-cohort="() => {}"
      @remove-cohort="() => {}"
    />
    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ProjectTodos :is-disabled="proposalStore.currentProposal?.isLocked" :project-todos="projectTodos"></ProjectTodos>
    <DIZDetailSection></DIZDetailSection>
    <ContractParticipants v-if="showContractingParticipants" />
    <LocationVotePanel v-if="showLocationVotePanel" />
    <ProjectPublications v-if="showPublications"></ProjectPublications>
    <ProjectHistory />

    <div class="divider" />
    <FdpgCheckNotes v-if="proposalStore.currentProposal?.fdpgCheckNotes" />
    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_LOCATION" :possible-locations="possibleLocations" />
  </el-container>

  <UacAcceptProposalDialog v-model="isAcceptDialogOpen" @accept-contract="handleUacApprovalConfirm" />

  <DeclineDialog
    v-model="isDeclineApprovalDialogOpen"
    title="proposal.uacApprovalDeclineModalTitle"
    description="proposal.uacApprovalDeclineModalDescription"
    button-text="proposal.rejectRequest"
    @confirm="handleUacApprovalDeclineConfirm"
  />
</template>

<script setup lang="ts">
import AppendixInfo from '@/components/AppendixInfo.vue'
import DeclineDialog from '@/components/DeclineDialog.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectTodos from '@/components/ProjectTodos.vue'
import ProjectHistory from '@/components/Proposals/Details/ProjectHistory.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import FdpgCheckNotes from '@/components/FdpgCheckNotes.vue'
import UacAcceptProposalDialog from '@/components/UacAcceptProposalDialog.vue'
import ContractParticipants from '@/components/ContractParticipants.vue'
import LocationVotePanel from '@/components/LocationVotePanel.vue'
import useNotifications from '@/composables/use-notifications'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import { LocationState, ProposalStatus } from '@/types/proposal.types'
import { ProposalType } from '@/types/proposal-type.enum'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import type { UacApprovalDecision } from '@/types/uac-approval.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ReviewMemberCohortSelection from '@/pages/Proposals/Casesohort/ReviewMemberCohortSelection.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import DIZDetailSection from '@/components/DIZDetailSection.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'

const { t } = useI18n()
const showPublications = ref(false)

const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
const router = useRouter()
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

const locationStore = useLocationStore()

const locationMapRef: Ref<Record<string, ILocation>> = ref({})

const possibleLocations = computed(() =>
  (proposalStore?.currentProposal?.userProject?.addressees?.desiredLocations ?? [])
    .map((locId) => locationMapRef.value?.[locId])
    .filter((loc) => loc),
)

const showLocationVotePanel = computed(() => {
  return status.value === ProposalStatus.LocationCheck || showContractingParticipants.value
})
const currentProposalStatus = [
  ProposalStatus.ExpectDataDelivery,
  ProposalStatus.DataResearch,
  ProposalStatus.DataCorrupt,
  ProposalStatus.FinishedProject,
  ProposalStatus.ReadyToArchive,
]

const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()

const openProposal = () => {
  router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
}

const { showErrorMessage, showSuccessMessage } = useNotifications()

const isAcceptDialogOpen = ref(false)
const isDeclineApprovalDialogOpen = ref(false)

const setUacApproval = async (decision: UacApprovalDecision) => {
  try {
    await proposalStore.setUacVote(proposalId.value, decision)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: RouteName.Dashboard })
  } catch (error) {
    console.log(error)
    showErrorMessage(t('general.failedSubmit'))
  }
}

const handleUacApprovalConfirm = async (file?: UploadFile, conditionReasoning?: string) => {
  await setUacApproval({ value: true, file: file?.raw, conditionReasoning })
}

const handleUacApprovalDeclineConfirm = async (declineReason: string) => {
  await setUacApproval({ value: false, declineReason })
}

const handleUacApprovalTodo = (decision: boolean) => {
  if (decision === true) {
    isAcceptDialogOpen.value = true
  } else {
    isDeclineApprovalDialogOpen.value = true
  }
}

const projectDuration = computed(
  () => proposalStore.currentProposal?.userProject.generalProjectInformation.projectDuration,
)
const ownerName = computed(() => proposalStore.currentProposal?.ownerName)

const quickInfo = computed<IQuickInfo[]>(() => [
  {
    icon: 'bi-people-fill',
    label: t('general.applicant'),
    values: [ownerName.value || '-'],
  },
  {
    icon: 'bi-graph-up',
    label: t('proposal.projectDuration'),
    values: [projectDuration.value || '-'],
  },
])

const topBarButtons: IButtonConfig[] = [
  {
    label: 'proposal.exportAttachments',
    testId: 'button__exportAttachments',
    isHidden: !proposalId.value || proposalStore.currentProposal?.uploads?.length === 0,
    action: async () => {
      if (proposalId.value) {
        try {
          await proposalStore.exportAllUploadsAsZip()
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to export uploads'
          showErrorMessage(errorMessage)
        }
      }
    },
  },
  {
    type: 'primary',
    label: 'proposal.toTheRequest',
    testId: 'button__toProposal',
    action: () => openProposal(),
  },
]

const getApproveTodo = (): IProjectTodo[] => {
  const isLocationCheckStatus = proposalStore.currentProposal?.status === ProposalStatus.LocationCheck
  const isDizApproved = proposalStore.currentProposal?.locationStatus === LocationState.DizApproved

  if (isLocationCheckStatus && isDizApproved) {
    return [
      {
        title: t('proposal.uacApprovalTodoTitle'),
        description: t('proposal.uacApprovalTodoDescription'),
        action: (decision: boolean) => handleUacApprovalTodo(decision),
        type: 'decision',
        testId: 'todo__button__uacApproval',
        readonly: false,
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return [...getApproveTodo(), ...getAdditionalLocationInformationTodo()]
})
const getAdditionalLocationInformationTodo = (afterLocationCheck = false): IProjectTodo[] => {
  const proposal = proposalStore.currentProposal
  if (!proposal) {
    return []
  }

  if (proposal.requestedButExcludedLocations.length > 0) {
    return []
  }

  const afterLocationCheckStatuses = [
    ProposalStatus.Contracting,
    ProposalStatus.ExpectDataDelivery,
    ProposalStatus.DataResearch,
    ProposalStatus.DataCorrupt,
    ProposalStatus.ReadyToArchive,
    ProposalStatus.FinishedProject,
    ProposalStatus.Archived,
    ProposalStatus.Rejected,
  ]

  if (afterLocationCheck) {
    if (!proposal.status || !afterLocationCheckStatuses.includes(proposal.status)) {
      return []
    }
  } else {
    if (proposal.status !== ProposalStatus.LocationCheck) {
      return []
    }
  }

  const additionalLocationInformation = proposal.additionalLocationInformation[0] ?? {
    legalBasis: false,
    locationPublicationName: '',
  }

  return [
    {
      title: t('proposal.updateAdditionalLocationInformationTodoTitle'),
      description: t('proposal.updateAdditionalLocationInformationTodoDescription'),
      action: (): void => {},
      type: 'additional-location-information',
      additionalInformation: additionalLocationInformation,
      readonly: true,
    },
  ]
}
const fetchProposal = async () => {
  try {
    const data = await proposalStore.setCurrentProposal(params.id as string)
    showPublications.value =
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
    showErrorMessage(t('general.failedToLoadData'))
    await router.push({ name: RouteName.Dashboard })
    console.log(error)
  }
}

onMounted(async () => {
  await fetchProposal()

  const lm = await locationStore.getLocationLookupMap()
  locationMapRef.value = lm
})
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.uac-proposal-details-page {
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

.reject-button {
  background-color: $error !important;
}
</style>
