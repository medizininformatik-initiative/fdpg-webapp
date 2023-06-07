<template>
  <div class="fdpg-dashboard-page">
    <FdpgDashboardActions :actions="dashboardActions"></FdpgDashboardActions>
    <div class="header">
      <div>
        <h2 class="project-overview">{{ $t('dashboard.projectOverview') }}</h2>
        <p class="project-count">{{ $t('dashboard.projects', { count: proposalCount.total }) }}</p>
      </div>

      <FdpgSortSelect
        :sort-options="sortOptions"
        :sort-by="proposalStore.currentSortField"
        :sort-order="proposalStore.currentSortDirection"
        @sort-change="proposalStore.setSortField"
        @sort-order-change="proposalStore.toggleSortDirection()"
      />
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FdpgSortSelect from '../FdpgSortSelect.vue'
import { sortOptions } from './constants'

const router = useRouter()
const route = useRoute()
const routeName = computed(() => route.name || RouteName.Dashboard)

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
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 29px;
}
</style>
