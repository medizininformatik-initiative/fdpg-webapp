<template>
  <div class="fdpg-member-dashboard-page">
    <div class="header">
      <div class="lead">
        <h2 class="title">
          {{ $t(header.main) }}
        </h2>
        <p class="description">
          {{ $t(header.sub, { x: proposalCount.total }) }}
        </p>
      </div>
      <FdpgSortSelect
        :sort-options="sortOptions"
        :sort-by="proposalStore.currentSortField"
        :sort-order="proposalStore.currentSortDirection"
        @sort-change="proposalStore.setSortField"
        @sort-order-change="proposalStore.toggleSortDirection()"
      />
    </div>
    <template v-for="(panel, index) in panels" :key="'panel' + index">
      <FdpgProposalCardPanel
        v-if="!panel.isTable"
        :panel="panel"
        :sort-by="proposalStore.currentSortField"
        :sort-order="proposalStore.currentSortDirection"
      />
      <FdpgTable
        v-if="panel.isTable"
        :panel="panel"
        :columns="tableColumns[panel.query]"
        :user-role="Role.FdpgMember"
        @row-click="handleRowClick"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import FdpgSortSelect from '@/components/FdpgSortSelect.vue'
import FdpgTable from '@/components/FdpgTable.vue'
import usePanels from '@/composables/use-panels'
import { tableColumns } from '@/constants'
import type { TranslationSchema } from '@/plugins/i18n'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import type { FdpgDashboardRoutes } from '@/types/route-name.enum'
import { RouteName } from '@/types/route-name.enum'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sortOptions } from './constants'

const router = useRouter()
const route = useRoute()
const routeName = computed(() => route.name || RouteName.Dashboard)

interface Header {
  main: TranslationSchema
  sub: TranslationSchema
}
const header = computed<Header>(() => {
  switch (routeName.value as FdpgDashboardRoutes) {
    case RouteName.Pending:
      return {
        main: 'dashboard.pendingContracts',
        sub: 'dashboard.xOutstandingProjectContracts',
      }

    case RouteName.Ongoing:
      return {
        main: 'general.current',
        sub: 'dashboard.xOngoingProjectContracts',
      }

    case RouteName.Completed:
      return {
        main: 'general.completed',
        sub: 'dashboard.xCompletedProjectContracts',
      }

    default:
      return {
        main: 'general.requested',
        sub: 'dashboard.xProposals',
      }
  }
})

const proposalStore = useProposalStore()
// Reset the current proposal for next detail open
proposalStore.setCurrentProposal(undefined)

const { panels, proposalCount } = usePanels(routeName)

const handleRowClick = ({ id }) => {
  router.push({ name: RouteName.ProposalDetails, params: { id } })
}
</script>

<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.fdpg-member-dashboard-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 29px;

    .lead {
      .title {
        font-size: 32px;
        margin-top: 0;
        margin-bottom: 3px;
      }

      .description {
        font-weight: 600;
        margin: 0;
      }
    }
  }
}
</style>
