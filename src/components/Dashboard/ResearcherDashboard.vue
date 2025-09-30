<template>
  <div class="fdpg-dashboard-page">
    <FdpgIAlertBox v-if="alertConfig.isVisible" :message="alertConfig.message" :logoBase64="alertConfig.logoBase64" />
    <FdpgDashboardActions :actions="dashboardActions"></FdpgDashboardActions>
    <div class="header">
      <div>
        <h2 class="project-overview">{{ t('dashboard.projectOverview') }}</h2>
        <p class="project-count">{{ t('dashboard.projects', { count: proposalCount.total }) }}</p>
      </div>
      <div class="sort">
        <el-button type="primary" class="register-project-button" @click="openRegisterProjectDialog">
          {{ t('dashboard.registerProject') }}
        </el-button>
        <FdpgSortSelect
          :sort-options="sortOptions"
          :sort-by="proposalStore.currentSortField"
          :sort-order="proposalStore.currentSortDirection"
          @sort-change="proposalStore.setSortField"
          @sort-order-change="proposalStore.toggleSortDirection()"
        />
      </div>
    </div>
    <FdpgProposalCardPanel
      v-for="(panel, index) in panels"
      :key="index"
      :panel="panel"
      :sort-by="proposalStore.currentSortField"
      :sort-order="proposalStore.currentSortDirection"
    />
  </div>
</template>

<script setup lang="ts">
import FdpgDashboardActions from '@/components/FdpgDashboardActions.vue'
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import usePanels from '@/composables/use-panels'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IDashboardAction } from '@/types/dashboard-actions.interface'
import { RouteName } from '@/types/route-name.enum'
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FdpgSortSelect from '../FdpgSortSelect.vue'
import { sortOptions } from './constants'
import { useI18n } from 'vue-i18n'
import FdpgIAlertBox from '../FdpgIAlertBox.vue'
import { useConfigStore } from '@/stores/config/config.store'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const configStore = useConfigStore()
const routeName = computed(() => route.name || RouteName.Dashboard)
const alertConfig = computed(() => configStore.alertConfig)

const dashboardActions: IDashboardAction[] = [
  {
    descriptionText: 'dashboard.researchRequestForDataDelivery',
    actionText: 'dashboard.makeARequest',
    style: 'blue',
    action: () => createProposal(),
    testId: 'dashboard.makeARequest',
  },
  {
    descriptionText: 'dashboard.checkFeasibilityForDataDelivery',
    actionText: 'dashboard.checkFeasibility',
    style: 'green',
    action: () => checkFeasibility(),
    testId: 'dashboard.checkFeasibility',
  },
]

const proposalStore = useProposalStore()
const { panels, proposalCount } = usePanels(routeName)

// Reset the current proposal for next detail open
proposalStore.setCurrentProposal(undefined)

const createProposal = () => {
  router.push({ name: RouteName.CreateProposal })
}

const checkFeasibility = () => {
  window.open(import.meta.env.VITE_FEASIBILITY_HOST)
}
const openRegisterProjectDialog = () => {
  router.push({ name: RouteName.RegisterNewProject })
}
onMounted(() => {
  configStore.getAlertConfig()
})
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 29px;
}
.sort {
  display: flex;
  justify-content: space-between;
  max-width: 500px;
  align-items: center;
  width: 100%;
  .register-project-button {
    margin-top: 14px;
  }
}
</style>
