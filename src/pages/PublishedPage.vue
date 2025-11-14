<template>
  <div class="fdpg-published-page">
    <div class="header">
      <div>
        <h2 class="project-overview">{{ t('sidebar.published') }}</h2>
        <p class="project-count">{{ t('dashboard.projects', { count: proposalCount.total }) }}</p>
      </div>
      <div class="sort">
        <router-link :to="{ name: RouteName.RegisterNewProject }" class="register-project-button">
          <el-button type="primary">
            {{ t('dashboard.registerProject') }}
          </el-button>
        </router-link>
        <FdpgSortSelect
          :sort-options="sortOptions"
          :sort-by="proposalStore.currentSortField"
          :sort-order="proposalStore.currentSortDirection"
          @sort-change="proposalStore.setSortField"
          @sort-order-change="proposalStore.toggleSortDirection()"
        />
      </div>
    </div>
    <div v-for="panel in panels" :key="panel.query">
      <div class="sync-button-wrapper">
        <el-button
          v-if="isFdpgMember && panel.query === PanelQuery.FdpgPublishedReady"
          type="primary"
          @click="handleSyncAllProposalsClick"
          :disabled="isSyncAllDisabled"
        >
          {{ t('registeringForm.syncToWebsite') }}
        </el-button>
      </div>

      <FdpgProposalCardPanel
        :panel="panel"
        :sort-by="proposalStore.currentSortField"
        :sort-order="proposalStore.currentSortDirection"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import FdpgSortSelect from '@/components/FdpgSortSelect.vue'
import { sortOptions } from '@/components/Dashboard/constants'
import usePanels from '@/composables/use-panels'
import { useLayoutStore } from '@/stores/layout.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { RouteName } from '@/types/route-name.enum'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { PanelQuery } from '@/types/sort-filter.types'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { useProposalSync } from '@/composables/use-proposal-sync'
import useNotifications from '@/composables/use-notifications'

const { t } = useI18n()
const route = useRoute()
const routeName = computed(() => route.name || RouteName.Published)
const proposalStore = useProposalStore()
const { panels, proposalCount } = usePanels(routeName)
const { showErrorMessage } = useNotifications()
const layoutStore = useLayoutStore()
const authStore = useAuthStore()
const isFdpgMember = computed(() => authStore.singleKnownRole === Role.FdpgMember)
proposalStore.setCurrentProposal(undefined)

const { syncAllProposals, isSyncing } = useProposalSync()

const readyPanelCount = computed(() => {
  const counts = proposalStore.counts[PanelQuery.FdpgPublishedReady]
  return counts?.total || 0
})

const isSyncAllDisabled = computed(() => {
  return readyPanelCount.value === 0 || isSyncing.value
})

const handleSyncAllProposalsClick = async (): Promise<void> => {
  try {
    await syncAllProposals()
  } catch (error: any) {
    showErrorMessage(error.message || 'Unknown error')
  }
}

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
.sync-button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
