<template>
  <el-container class="diz-proposal-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ProjectTodos :is-disabled="proposalStore.currentProposal?.isLocked" :project-todos="projectTodos"></ProjectTodos>
    <ProjectPublications v-if="showPublications"></ProjectPublications>
    <ProjectHistory />

    <div class="divider" />
    <FdpgCheckNotes v-if="proposalStore.currentProposal?.fdpgCheckNotes" />
    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_LOCATION" />
  </el-container>

  <SignDialog v-model="isSignDialogOpen" @accept-contract="handleContractSignConfirm" />

  <DeclineDialog
    v-model="isDeclineDialogOpen"
    title="proposal.acceptContractDizDeclineModalTitle"
    description="proposal.acceptContractDizDeclineModalDescription"
    button-text="proposal.acceptContractDizDeclineModalAction"
    @confirm="handleDizDeclineConfirm"
  />

  <DeclineDialog
    v-model="isDeclineContractDialogOpen"
    title="proposal.locationSignDeclineModalTitle"
    description="proposal.locationSignDeclineModalDescription"
    button-text="proposal.rejectRequest"
    @confirm="handleContractDeclineConfirm"
  />
</template>

<script setup lang="ts">
import AppendixInfo from '@/components/AppendixInfo.vue'
import DeclineDialog from '@/components/DeclineDialog.vue'
import FdpgCheckNotes from '@/components/FdpgCheckNotes.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectTodos from '@/components/ProjectTodos.vue'
import ProjectHistory from '@/components/Proposals/Details/ProjectHistory.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import SignDialog from '@/components/SignDialog.vue'
import useNotifications from '@/composables/use-notifications'
import { useLayoutStore } from '@/stores/layout.store'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import type { DizApprovalDecision } from '@/types/diz-approval.types'
import type { IProjectTodo } from '@/types/project-todo.interface'
import { LocationState, ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import type { ContractDecision } from '@/types/sign-contract.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const showPublications = ref(false)
const messageBoxStore = useMessageBoxStore()
const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
const currentProposalStatus = [
  ProposalStatus.ExpectDataDelivery,
  ProposalStatus.DataResearch,
  ProposalStatus.DataCorrupt,
  ProposalStatus.FinishedProject,
  ProposalStatus.ReadyToArchive,
]
const router = useRouter()

const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

const openProposal = () => {
  router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
}

const setDizApproval = async (decision: DizApprovalDecision) => {
  try {
    await proposalStore.setDizApproval(proposalId.value, decision)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: RouteName.Dashboard })
  } catch (error) {
    console.log(error)
    showErrorMessage()
  }
}

const isDeclineDialogOpen = ref(false)
const handleDizDeclineConfirm = async (declineReason: string) => {
  await setDizApproval({ value: false, declineReason })
}
const handleDizApprovalAcceptDialog = async () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.acceptContractDizModalTitle',
    message: 'proposal.acceptContractDizModalDescription',
    confirmButtonText: 'proposal.acceptContractDizModalAction',
    callback: async (decision: DecisionType) =>
      decision === 'confirm' ? await setDizApproval({ value: true }) : undefined,
  })
}

const handleDizApprovalTodo = async (decision: boolean) => {
  if (decision === true) {
    await handleDizApprovalAcceptDialog()
  } else {
    isDeclineDialogOpen.value = true
  }
}

const isSignDialogOpen = ref(false)
const isDeclineContractDialogOpen = ref(false)

const setContractSign = async (decision: ContractDecision) => {
  try {
    await proposalStore.signContract(proposalId.value, decision)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: RouteName.Dashboard })
  } catch (error: any) {
    showErrorMessage(t('general.failedSubmit'))
  }
}

const handleContractSignConfirm = async (file: UploadFile) => {
  await setContractSign({ value: true, file: file?.raw })
}

const handleContractDeclineConfirm = async (declineReason: string) => {
  await setContractSign({ value: false, declineReason })
}

const handleSignTodo = (decision: boolean) => {
  if (decision === true) {
    isSignDialogOpen.value = true
  } else {
    isDeclineContractDialogOpen.value = true
  }
}

const getSignTodo = (): IProjectTodo[] => {
  const isContractingStatus = proposalStore.currentProposal?.status === ProposalStatus.Contracting

  // If the locationStatus is getting the researcher sign state,
  // it means that the location has not signed yet
  const isAcceptedByResearcher =
    proposalStore.currentProposal?.locationStatus === LocationState.ResearcherAcceptedContract

  if (isContractingStatus && isAcceptedByResearcher) {
    return [
      {
        title: t('proposal.locationSingTodoTitle'),
        description: t('proposal.locationSingTodoDescription'),
        action: (decision: boolean) => handleSignTodo(decision),
        type: 'decision',
        testId: 'todo__button__signContract',
      },
    ]
  } else {
    return []
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
    type: 'primary',
    label: 'proposal.toTheRequest',
    testId: 'button__toProposal',
    action: () => openProposal(),
  },
]

const getApproveTodo = (): IProjectTodo[] => {
  const isLocationCheckStatus = proposalStore.currentProposal?.status === ProposalStatus.LocationCheck
  const isDizCheckStatus = proposalStore.currentProposal?.locationStatus === LocationState.IsDizCheck

  if (isLocationCheckStatus && isDizCheckStatus) {
    return [
      {
        title: t('proposal.acceptContractDizTodoTitle'),
        description: t('proposal.acceptContractDizTodoDescription'),
        action: (decision: boolean) => handleDizApprovalTodo(decision),
        type: 'decision',
        testId: 'todo__button__dizApproval',
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return [...getApproveTodo(), ...getSignTodo()]
})

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
    showErrorMessage()
    await router.push({ name: RouteName.Dashboard })
    console.log(error)
  }
}

onMounted(async () => {
  await fetchProposal()
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.diz-proposal-details-page {
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
