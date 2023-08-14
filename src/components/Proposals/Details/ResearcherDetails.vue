<template>
  <el-container class="fdpg-proposal-details-page" v-if="proposalStore.currentProposal">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>
    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ContractParticipants v-if="showContractingParticipants" />
    <LocationVotePanel v-if="showLocationVotePanel" />
    <ProjectTodos :is-disabled="proposalStore.currentProposal?.isLocked" :project-todos="projectTodos"></ProjectTodos>
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
    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_OWNER" />
  </el-container>

  <SignDialog v-model="isSignDialogOpen" @accept-contract="handleContractSignConfirm" />
  <DeclineDialog
    v-model="isDeclineContractDialogOpen"
    title="proposal.rejectContractProposal"
    description="proposal.rejectContractProposalModalDescriptionResearcher"
    button-text="proposal.rejectRequest"
    @confirm="handleContractDeclineConfirm"
  />
</template>

<script setup lang="ts">
import DeclineDialog from '@/components/DeclineDialog.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import MessageCenter from '@/components/MessageCenter.vue'
import ProjectPublications from '@/components/ProjectPublications.vue'
import ProjectReports from '@/components/ProjectReports.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectTodos from '@/components/ProjectTodos.vue'
import ProjectHistory from '@/components/Proposals/Details/ProjectHistory.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import SignDialog from '@/components/SignDialog.vue'
import ContractParticipants from '@/components/ContractParticipants.vue'
import LocationVotePanel from '@/components/LocationVotePanel.vue'
import useNotifications from '@/composables/use-notifications'
import { useCommentStore } from '@/stores/comment/comment.store'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import type { ICommentDetail } from '@/types/comment.interface'
import { CommentType } from '@/types/comment.interface'
import type { IProjectTodo } from '@/types/project-todo.interface'
import { ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import type { ContractDecision } from '@/types/sign-contract.types'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import type { UploadFile } from 'element-plus'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppendixInfo from '../../AppendixInfo.vue'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'

const { t } = useI18n()
const messageBoxStore = useMessageBoxStore()
const { params } = useRoute()
const proposalId = computed(() => params.id as string)
const router = useRouter()
const currentProposalStatus = [ProposalStatus.ExpectDataDelivery, ProposalStatus.DataResearch, ProposalStatus.DataCorrupt, ProposalStatus.FinishedProject, ProposalStatus.ReadyToArchive]

const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
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
const status = computed(() => proposalStore.currentProposal?.status as ProposalStatus)

const { showErrorMessage, showSuccessMessage } = useNotifications()

const openProposal = (anchor?: string) => {
  if (anchor) {
    router.push({ name: RouteName.EditProposal, params: { id: proposalId.value }, query: { anchor } })
  } else {
    router.push({ name: RouteName.EditProposal, params: { id: proposalId.value } })
  }
}

const isSignDialogOpen = ref(false)
const isDeclineContractDialogOpen = ref(false)
const showPublicationsAndReports = ref(false)
const handleSignContract = (decision: boolean) => {
  if (decision === true) {
    isSignDialogOpen.value = true
  } else if (decision === false) {
    isDeclineContractDialogOpen.value = true
  }
}

const handleFinishProjectWithModal = () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.researcherFinishProjectModalTitle',
    message: 'proposal.researcherFinishProjectModalDescription',
    confirmButtonText: 'general.confirm',
    callback: async(decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.FinishedProject) : undefined,
  })
}

const hasDeclinedFinishProject = ref(false)
const handleFinishProject = (decision: boolean) => {
  if (decision === true) {
    handleFinishProjectWithModal()
  } else if (decision === false) {
    hasDeclinedFinishProject.value = true
  }
}

const setContractSign = async (decision: ContractDecision) => {
  try {
    await proposalStore.signContract(params.id as string, decision)
    showSuccessMessage(t('general.submitted'))
    await router.push({ name: RouteName.Dashboard })
  } catch (error: any) {
    showErrorMessage(t('general.failedSubmit'))
  }
}

const handleContractSignConfirm = async (file: UploadFile) => {
  await setContractSign({ value: true, file: file.raw })
}

const handleContractDeclineConfirm = async (declineReason: string) => {
  await setContractSign({ value: false, declineReason })
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

const handleArchiveProjectClick = () => {
  messageBoxStore.setMessageBoxInfo({
    cancelButtonText: 'general.cancel',
    cancelButtonClass: 'el-button--text',
    showCancelButton: true,
    title: 'proposal.archiveProjectModalTitle',
    message: 'proposal.archiveProjectModalDescription',
    confirmButtonText: 'proposal.archiveProject',
    callback: async(decision: DecisionType) =>
      decision === 'confirm' ? await changeStatus(ProposalStatus.Archived) : undefined,
  })
}

const projectDuration = computed(
  () => proposalStore.currentProposal?.userProject.generalProjectInformation.projectDuration,
)
const numberOfRequestedInstitutions = computed(() => proposalStore.currentProposal?.numberOfRequestedLocations)

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
])

const topBarButtons = computed<IButtonConfig[]>(() => [
  {
    type: 'primary',
    label: 'proposal.toTheRequest',
    testId: 'button__toProposal',
    action: () => openProposal(),
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

const getCommentTodos = (comments: ICommentDetail[]): IProjectTodo[] => {
  return comments
    .filter((comment) => comment.type === CommentType.PROPOSAL_TASK && !comment.isDone)
    .map((comment) => {
      return {
        title: `${t('proposal.proposalTask')}: `,
        description: comment.content,
        date: new Date(comment.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        action: () => openProposal(comment._id),
        actionLabel: 'proposal.viewTodoInProposal',
        type: 'comment',
        testId: 'todo__button__viewTodoInProposal',
      }
    })
}

const getContractSignTodo = (): IProjectTodo[] => {
  const isContractingStatus = proposalStore.currentProposal?.status === ProposalStatus.Contracting
  const researcherAlreadyDecided =
    proposalStore.currentProposal?.contractAcceptedByResearcher ||
    proposalStore.currentProposal?.contractRejectedByResearcher

  if (isContractingStatus && !researcherAlreadyDecided) {
    const numberOfApprovedLocations = proposalStore.currentProposal?.numberOfApprovedLocations
    return [
      {
        title: t('proposal.acceptContract'),
        description: t('proposal.acceptContractDescriptionResearcher', { numberOfApprovedLocations }),
        action: (decision: boolean) => handleSignContract(decision),
        type: 'decision',
        testId: 'todo__button__signContract',
      },
    ]
  } else {
    return []
  }
}

const getFinishProjectTodo = (hasDeclined: boolean): IProjectTodo[] => {
  const isReadyToFinishProject = proposalStore.currentProposal?.status === ProposalStatus.DataResearch

  if (isReadyToFinishProject && !hasDeclined) {
    return [
      {
        title: t('proposal.researcherFinishProjectTodoTitle'),
        description: t('proposal.researcherFinishProjectTodoDescription'),
        action: (decision: boolean) => handleFinishProject(decision),
        type: 'decision',
        testId: 'todo__button__finishProject',
      },
    ]
  } else {
    return []
  }
}

const projectTodos = computed<IProjectTodo[]>(() => {
  return [
    ...getContractSignTodo(),
    ...getFinishProjectTodo(hasDeclinedFinishProject.value),
    ...getCommentTodos(commentStore.comments),
  ]
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

const commentStore = useCommentStore()
const fetchComments = async () => {
  try {
    await commentStore.fetchAll({ proposalId: params.id as string })
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  await fetchProposal()
  await fetchComments()
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-proposal-details-page {
  flex-direction: column;

  .section {
    margin-bottom: 32px;

    .section-title {
      margin-bottom: 22px;
    }
  }
}
</style>
