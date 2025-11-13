<template>
  <el-container class="diz-proposal-details-page">
    <DetailTopBar :buttons="topBarButtons"></DetailTopBar>
    <QuickInfo :items="quickInfo"></QuickInfo>
    <AppendixInfo></AppendixInfo>

    <ProjectStatus :proposal-status="status"></ProjectStatus>
    <ProjectHistory />

    <MessageCenter :type="CommentType.PROPOSAL_MESSAGE_TO_DMST" :possible-locations="possibleLocations" />
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
import { useMessageBoxStore } from '@/stores/messageBox.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IButtonConfig } from '@/types/button-config.interface'
import { ProposalStatus } from '@/types/proposal.types'
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
const locationStore = useLocationStore()

const locationMapRef: Ref<Record<string, ILocation>> = ref({})

const possibleLocations = computed(() =>
  (proposalStore?.currentProposal?.userProject?.addressees?.desiredLocations ?? [])
    .map((locId) => locationMapRef.value?.[locId])
    .filter((loc) => loc),
)

const openProposal = () => {
  router.push({ name: RouteName.ReviewProposal, params: { id: params.id } })
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

  const lm = await locationStore.getLocationLookupMap()
  locationMapRef.value = lm
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
