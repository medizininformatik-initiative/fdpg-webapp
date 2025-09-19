<template>
  <div class="fdpg-published-page">
    <div class="header">
      <div>
        <h2 class="project-overview">{{ t('sidebar.published') }}</h2>
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
      :panel="panel"
      :sort-by="proposalStore.currentSortField"
      :sort-order="proposalStore.currentSortDirection"
    />
  </div>
</template>

<script setup lang="ts">
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import FdpgSortSelect from '@/components/FdpgSortSelect.vue'
import { sortOptions } from '@/components/Dashboard/constants'
import usePanels from '@/composables/use-panels'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { CardType } from '@/types/component.types'
import type { PanelType } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { PanelQuery } from '@/types/sort-filter.types'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const routeName = computed(() => route.name || RouteName.Published)
const proposalStore = useProposalStore()
const { proposalCount } = usePanels(routeName)

const panel: PanelType = { type: CardType.Draft, header: 'sidebar.published', query: PanelQuery.RegisterProposals }

const layoutStore = useLayoutStore()

// Reset the current proposal for next detail open
proposalStore.setCurrentProposal(undefined)

onMounted(() => {
  layoutStore.setBreadcrumbs([])
})
</script>

<style lang="scss" scoped>
.fdpg-published-page {
  margin-top: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 29px;
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
}

.project-overview {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.project-count {
  font-size: 14px;
  color: #666;
  margin: 0;
}
</style>
