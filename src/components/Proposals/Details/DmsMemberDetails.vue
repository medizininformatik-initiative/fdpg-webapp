<template>
  <el-container class="diz-proposal-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>

    <ProjectStatus :proposal-status="proposalStatus"></ProjectStatus>
    <ProjectTodos :project-todos="projectTodos" />
    <ProjectHistory />

    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_DMST" :possible-locations="[]" />
    <div class="divider" />
  </el-container>
</template>

<script setup lang="ts">
import AppendixInfo from '@/components/AppendixInfo.vue'
import DetailTopBar from '@/components/DetailTopBar.vue'
import ProjectStatus from '@/components/ProjectStatus.vue'
import ProjectHistory from '@/components/Proposals/Details/ProjectHistory.vue'
import QuickInfo from '@/components/QuickInfo.vue'
import useNotifications from '@/composables/use-notifications'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { DeliveryAcceptance, ProposalStatus } from '@/types/proposal.types'
import type { IQuickInfo } from '@/types/quick-info.interface'
import { RouteName } from '@/types/route-name.enum'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import MessageCenter from '@/components/MessageCenter.vue'
import { CommentType } from '@/types/comment.interface'
import ProjectTodos from '@/components/ProjectTodos.vue'
import type { IProjectTodo } from '@/types/project-todo.interface.ts'
import { getLocaleDateString } from '@/utils/date.util.ts'

// Composables
const { t } = useI18n()
const router = useRouter()
const { params } = useRoute()
const { showErrorMessage } = useNotifications()

// Stores
const layoutStore = useLayoutStore()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()

// Refs
const showPublications = ref(false)
const locationMapRef: Ref<Record<string, ILocation>> = ref({})

// Computed
const proposalId = computed(() => params.id as string)
const proposalStatus = computed(() => proposalStore.currentProposal?.status as ProposalStatus)
const proposalOwnerName = computed(() => proposalStore.currentProposal?.ownerName)
const proposalDataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)

const projectTodos = computed<IProjectTodo[]>(() =>
  proposalStore.currentProposal?.dataDelivery?.acceptance === DeliveryAcceptance.PENDING
    ? [dmsAsDataDeliveryPartnerAcceptanceTodo.value]
    : [],
)
const projectDuration = computed(
  () => proposalStore.currentProposal?.userProject.generalProjectInformation.projectDuration,
)

const localDueDateForManagementSiteConfirmation = computed(() => {
  const baseDateString = proposalDataDelivery.value?.createdAt ?? proposalDataDelivery.value?.updatedAt

  if (baseDateString === undefined) {
    return undefined
  }

  const baseDate = new Date(baseDateString)
  const dueDate = new Date()
  dueDate.setDate(baseDate.getDate() + 3)
  return getLocaleDateString(dueDate)
})

const dmsAsDataDeliveryPartnerAcceptanceTodo = computed<IProjectTodo>(() => {
  return {
    title: t('dataDelivery.dmstQuestionOfAcceptanceHeader'),
    description: t('dataDelivery.dmstQuestionOfAcceptanceBody', {
      dueDate: localDueDateForManagementSiteConfirmation.value,
    }),
    type: 'decision',
    readonly: false,
    action: handleDmsAcceptanceResponse,
  }
})

const quickInfo = computed<IQuickInfo[]>(() => [
  {
    icon: 'bi-people-fill',
    label: t('general.applicant'),
    values: [proposalOwnerName.value || '-'],
  },
  {
    icon: 'bi-graph-up',
    label: t('proposal.projectDuration'),
    values: [projectDuration.value || '-'],
  },
])

// Constants
const currentProposalStatus = [
  ProposalStatus.ExpectDataDelivery,
  ProposalStatus.DataResearch,
  ProposalStatus.DataCorrupt,
  ProposalStatus.FinishedProject,
  ProposalStatus.ReadyToArchive,
]

const topBarButtons: IButtonConfig[] = [
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
    type: 'primary',
    label: 'proposal.toTheRequest',
    testId: 'button__toProposal',
    action: () => openProposal(),
  },
]

// Methods
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

const openProposal = () => {
  router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
}

const handleDmsAcceptanceResponse = async (isAccepted: boolean) => {
  const proposalId = proposalStore.currentProposal?._id
  const dmsId = proposalDataDelivery.value?.dataManagementSite

  if (proposalId !== undefined && proposalId !== '' && dmsId !== undefined && dmsId !== '') {
    try {
      await proposalStore.updateDmsAcceptanceForDataDelivery(
        proposalId,
        dmsId,
        isAccepted ? DeliveryAcceptance.ACCEPTED : DeliveryAcceptance.DENIED,
      )
    } catch {
      showErrorMessage()
    }
  }
}

// Lifecycles
onMounted(async () => {
  await fetchProposal()

  locationMapRef.value = await locationStore.getLocationLookupMap()
})
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

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
