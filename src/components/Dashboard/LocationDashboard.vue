<template>
  <div class="fdpg-dashboard-page">
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
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import usePanels from '@/composables/use-panels'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import FdpgSortSelect from '@/components/FdpgSortSelect.vue'
import { sortOptions } from './constants'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { RouteName } from '@/types/route-name.enum'

const route = useRoute()
const routeName = computed(() => route.name || RouteName.Dashboard)
const proposalStore = useProposalStore()
const { panels, proposalCount } = usePanels(routeName)

// Reset the current proposal for next detail open
proposalStore.setCurrentProposal(undefined)
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 29px;
}
</style>
