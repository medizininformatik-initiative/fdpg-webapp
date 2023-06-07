<template>
  <el-container class="uac-proposal-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ProjectTodos :is-disabled="proposalStore.currentProposal?.isLocked" :project-todos="projectTodos"></ProjectTodos>
    <ProjectPublications v-if="showPublications"></ProjectPublications>
    <ProjectHistory />

    <div class="divider" />
    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_LOCATION" />
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
import UacAcceptProposalDialog from '@/components/UacAcceptProposalDialog.vue'
import useNotifications from '@/composables/use-notifications'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { CommentType } from '@/types/comment.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import { LocationState, ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import type { UacApprovalDecision } from '@/types/uac-approval.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const showPublications = ref(false)

const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
const router = useRouter()

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

const handleUacApprovalConfirm = async (dataAmount: number, file?: UploadFile) => {
  await setUacApproval({ value: true, dataAmount, file: file?.raw })
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
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return [...getApproveTodo()]
})

const fetchProposal = async () => {
  try {
    const data = await proposalStore.setCurrentProposal(params.id as string)
    showPublications.value =
      data.status ===
        ('EXPECT_DATA_DELIVERY' || 'DATA_RESEARCH' || 'DATA_CORRUPT' || 'FINISHED_PROJECT' || 'READY_TO_ARCHIVE') ||
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
  background-color: $red-100 !important;
}
</style>
