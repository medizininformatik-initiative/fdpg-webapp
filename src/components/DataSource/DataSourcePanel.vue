<template>
  <div class="data-source-page">
    <div class="header">
      <div class="lead">
        <h2 class="title">
          {{ t('general.dataSources') }}
        </h2>
      </div>
    </div>

    <div class="controls-row">
      <el-input
        v-model="searchQuery"
        :placeholder="t('general.search')"
        :suffix-icon="Search"
        clearable
        @input="onSearchChange"
        style="width: 300px"
        class="search-input"
      />
      <el-button type="primary" @click="triggerSync" :disabled="isLoading || isSyncing" :loading="isSyncing">
        {{ t('general.syncDataSources') }}
      </el-button>
    </div>

    <div v-if="isSyncing" class="sync-alert">
      <el-alert :title="t('general.syncInProgress')" type="info" :closable="false" show-icon>
        <template #default>
          {{ t('general.syncInProgressMessage') }}
        </template>
      </el-alert>
    </div>

    <DataSourceOverviewTable
      :data-sources="dataSourcesRef"
      :loading="isLoading"
      :pagination="paginationRef"
      @updateActive="updateActive"
      @approve="approveDataSource"
      @pageChange="onPageChange"
      @sortChange="onSortChange"
      @filterChange="onFilterChange"
    />
  </div>
</template>

<script setup lang="ts">
import { useDataSourceStore } from '@/stores/data-source/data-source.store'
import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from '@element-plus/icons-vue'
import DataSourceOverviewTable from './DataSourceOverviewTable.vue'
import {
  DataSourceStatus,
  DataSourceSortField,
  SortOrder,
  type IDataSource,
  type ISyncStatus,
} from '@/types/data-source.types'
import useNotifications from '@/composables/use-notifications'

const { t, locale } = useI18n()
const dataSourceStore = useDataSourceStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

const dataSourcesRef: Ref<IDataSource[]> = ref([])
const paginationRef: Ref<{ page: number; pageSize: number; total: number; totalPages: number }> = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
})
const isLoading: Ref<boolean> = ref(false)
const searchQuery: Ref<string> = ref('')
const statusFilter: Ref<DataSourceStatus | undefined> = ref(undefined)
const sortBy: Ref<DataSourceSortField | undefined> = ref(undefined)
const sortOrder: Ref<SortOrder> = ref(SortOrder.ASC)
const syncStatus: Ref<ISyncStatus | null> = ref(null)
const syncStatusInterval: Ref<number | null> = ref(null)

const isSyncing = computed(() => syncStatus.value?.isRunning || false)

let searchTimeout: NodeJS.Timeout | null = null

const onSearchChange = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    paginationRef.value.page = 1
    loadDataSources()
  }, 500)
}

const onPageChange = (page: number) => {
  paginationRef.value.page = page
  loadDataSources()
}

const onSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (!order) {
    sortBy.value = undefined
    sortOrder.value = SortOrder.ASC
  } else {
    sortBy.value = prop as DataSourceSortField
    sortOrder.value = order === 'ascending' ? SortOrder.ASC : SortOrder.DESC
  }
  paginationRef.value.page = 1
  loadDataSources()
}

const onFilterChange = (filters: Record<string, any>) => {
  const statusValues = filters.status
  statusFilter.value = statusValues && statusValues.length > 0 ? statusValues[0] : undefined
  paginationRef.value.page = 1
  loadDataSources()
}

const loadDataSources = async () => {
  await wrapWithLoading(async () => {
    const result = await dataSourceStore.searchOverview({
      query: searchQuery.value || undefined,
      status: statusFilter.value,
      page: paginationRef.value.page,
      pageSize: paginationRef.value.pageSize,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      language: locale.value,
    })
    dataSourcesRef.value = result.data
    paginationRef.value = {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    }
  }, 'dataSource.failedToLoad')
}

const updateActive = async (dataSource: IDataSource, active: boolean) => {
  await wrapWithLoading(async () => {
    await dataSourceStore.updateActive(dataSource.externalIdentifier, { active })
    showSuccessMessage('dataSource.activeUpdated')
    // Update the data source in place instead of reloading all data
    const index = dataSourcesRef.value.findIndex((ds) => ds._id === dataSource._id)
    if (index !== -1) {
      dataSourcesRef.value[index].active = active
    }
  }, 'dataSource.failedToUpdateActive')
}

const approveDataSource = async (dataSource: IDataSource) => {
  await wrapWithLoading(async () => {
    await dataSourceStore.updateStatus(dataSource.externalIdentifier, { status: DataSourceStatus.APPROVED })
    showSuccessMessage('dataSource.approved')
    await loadDataSources()
  }, 'dataSource.failedToApprove')
}

const triggerSync = async () => {
  try {
    const result = await dataSourceStore.triggerSync()
    // Immediately set sync status to running
    syncStatus.value = {
      isRunning: true,
      startedAt: result.startedAt,
      lastCompletedAt: syncStatus.value?.lastCompletedAt || null,
      lastStats: syncStatus.value?.lastStats || null,
    }
    showSuccessMessage('dataSource.syncStarted')
    startSyncStatusPolling()
  } catch (e: any) {
    console.warn(e)
    if (e.response?.status === 409) {
      showErrorMessage('dataSource.syncAlreadyRunning')
    } else {
      showErrorMessage('dataSource.failedToStartSync')
    }
  }
}

const loadSyncStatus = async () => {
  try {
    const status = await dataSourceStore.getSyncStatus()
    syncStatus.value = status
    if (!status.isRunning && syncStatusInterval.value) {
      stopSyncStatusPolling()
    }
  } catch (e) {
    console.warn('Failed to load sync status', e)
  }
}

const startSyncStatusPolling = () => {
  if (syncStatusInterval.value) {
    return
  }
  syncStatusInterval.value = window.setInterval(() => {
    loadSyncStatus()
  }, 5000)
}

const stopSyncStatusPolling = () => {
  if (syncStatusInterval.value) {
    clearInterval(syncStatusInterval.value)
    syncStatusInterval.value = null
  }
}

const setLoading = (loading: boolean) => {
  isLoading.value = loading
}

const wrapWithLoading = async (cb: Function, errorMessage: string) => {
  setLoading(true)
  try {
    await cb()
  } catch (e) {
    console.warn(e)
    showErrorMessage(errorMessage)
  } finally {
    setLoading(false)
  }
}

onMounted(async () => {
  await loadDataSources()
  await loadSyncStatus()
  if (syncStatus.value?.isRunning) {
    startSyncStatusPolling()
  }
})

// Watch for locale changes and reload data to re-sort
watch(locale, () => {
  if (sortBy.value === DataSourceSortField.TITLE) {
    loadDataSources()
  }
})

onUnmounted(() => {
  stopSyncStatusPolling()
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.data-source-page {
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

  .controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 16px;

    .search-input :deep(.el-input__wrapper) {
      box-shadow: none;
      border-bottom: 1px solid $gray-600;
      border-radius: 0;
      padding-left: 0;
    }

    .search-input :deep(.el-input__wrapper:hover) {
      border-bottom-color: $gray-700;
    }

    .search-input :deep(.el-input__wrapper.is-focus) {
      border-bottom-color: $blue;
      box-shadow: none;
    }

    .sync-status {
      font-size: 14px;
      color: $gray-900;

      .status-running {
        color: $blue;
        font-weight: 500;
      }

      .status-completed {
        color: $green-pressed;
      }
    }
  }
}

.sync-alert {
  margin-bottom: 20px;
}
</style>
