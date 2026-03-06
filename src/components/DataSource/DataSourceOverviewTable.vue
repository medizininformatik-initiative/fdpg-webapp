<template>
  <div class="data-source-table">
    <el-table
      :data="dataSourcesCopy"
      row-key="_id"
      stripe
      v-loading="loading"
      :default-expand-all="false"
      @sort-change="handleSortChange"
      @filter-change="handleFilterChange"
    >
      <el-table-column type="expand">
        <template #default="expandProps">
          <div class="expand-container">
            <div class="data-source-row header">
              <div class="data-source-col">
                <strong>{{ t('general.field') }}</strong>
              </div>
              <div class="data-source-col">
                <strong>{{ t('general.value') }}</strong>
              </div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.id') }}</div>
              <div class="data-source-col">{{ expandProps.row._id }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.externalIdentifier') }}</div>
              <div class="data-source-col">{{ expandProps.row.externalIdentifier }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.origin') }}</div>
              <div class="data-source-col">{{ expandProps.row.origin }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.titles') }}</div>
              <div class="data-source-col">
                <div v-for="title in expandProps.row.titles" :key="title.language" class="language-item">
                  <strong>{{ title.language }}:</strong> {{ title.value }}
                </div>
              </div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.descriptions') }}</div>
              <div class="data-source-col">
                <div v-for="desc in expandProps.row.descriptions" :key="desc.language" class="language-item">
                  <strong>{{ desc.language }}:</strong> {{ desc.value }}
                </div>
              </div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.collection') }}</div>
              <div class="data-source-col">{{ expandProps.row.collection }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.classification') }}</div>
              <div class="data-source-col">{{ expandProps.row.classification }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.status') }}</div>
              <div class="data-source-col">
                <el-tag :type="expandProps.row.status === DataSourceStatus.APPROVED ? 'success' : 'warning'">
                  {{ t(`general.${expandProps.row.status}`.toLowerCase()) }}
                </el-tag>
              </div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.active') }}</div>
              <div class="data-source-col">
                <el-checkbox-group
                  :model-value="expandProps.row.active ? ['active'] : []"
                  @change="(value) => handleActiveChange(expandProps.row, value.includes('active'))"
                >
                  <FdpgCheckbox :value="'active'" :size="FdpgInputSize.Small">
                    {{ t('general.active') }}
                  </FdpgCheckbox>
                </el-checkbox-group>
              </div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.approvalDate') }}</div>
              <div class="data-source-col">{{ getLocaleDateTimeString(expandProps.row.approvalDate) }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.createdAt') }}</div>
              <div class="data-source-col">{{ getLocaleDateTimeString(expandProps.row.createdAt) }}</div>
            </div>

            <div class="data-source-row">
              <div class="data-source-col">{{ t('general.updatedAt') }}</div>
              <div class="data-source-col">{{ getLocaleDateTimeString(expandProps.row.updatedAt) }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="externalIdentifier"
        :label="t('general.externalIdentifier')"
        width="150"
        sortable="custom"
      />
      <el-table-column :label="t('general.title')" prop="title" sortable="custom">
        <template #default="props">
          {{ getTitle(props.row) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        width="150"
        min-width="150"
        :filters="[
          { text: t('general.pending'), value: DataSourceStatus.PENDING },
          { text: t('general.approved'), value: DataSourceStatus.APPROVED },
        ]"
        :filter-multiple="false"
      >
        <template #header>
          <span>{{ t('general.status') }}</span>
          <el-icon style="margin-left: 4px; vertical-align: middle"><Filter /></el-icon>
        </template>
        <template #default="props">
          <el-tag :type="props.row.status === DataSourceStatus.APPROVED ? 'success' : 'warning'" size="small">
            {{ t(`general.${props.row.status}`.toLowerCase()) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="active"
        width="130"
        min-width="130"
        :filters="[
          { text: t('general.yes'), value: 'true' },
          { text: t('general.no'), value: 'false' },
        ]"
        :filter-multiple="false"
      >
        <template #header>
          <span>{{ t('general.active') }}</span>
          <el-icon style="margin-left: 4px; vertical-align: middle"><Filter /></el-icon>
        </template>
        <template #default="props">
          <el-tag :type="props.row.active ? 'success' : 'info'" size="small">
            {{ props.row.active ? t('general.yes') : t('general.no') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" :label="t('general.operations')" width="80">
        <template #default="operationProps">
          <div class="operations-cell">
            <el-button
              v-if="operationProps.row.status === DataSourceStatus.PENDING"
              type="success"
              link
              size="small"
              @click="approve(operationProps.row)"
              :icon="Check"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DataSourceStatus, DataSourceSortField, getTitleByLanguage, type IDataSource } from '@/types/data-source.types'
import { getLocaleDateTimeString } from '@/utils/date.util'
import FdpgCheckbox from '@/components/FdpgCheckbox.vue'
import { FdpgInputSize } from '@/types/component.types'
import { Filter, Check } from '@element-plus/icons-vue'
import type { PropType } from 'vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  dataSources: {
    type: Array as PropType<IDataSource[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: true,
  },
  pagination: {
    type: Object as PropType<{ page: number; pageSize: number; total: number; totalPages: number }>,
    required: true,
  },
})

const { t, locale } = useI18n()
const emit = defineEmits(['updateActive', 'approve', 'pageChange', 'sortChange', 'filterChange'])

const currentPage = ref(props.pagination.page)

// Watch for pagination prop changes and update currentPage
watch(
  () => props.pagination.page,
  (newPage) => {
    currentPage.value = newPage
  },
)

// Remove reference for proper expand state isolation per row
const dataSourcesCopy = computed(() => props.dataSources.map((ds) => ({ ...ds })))

const getTitle = (dataSource: IDataSource): string => {
  return getTitleByLanguage(dataSource, locale.value)
}

const handleActiveChange = (dataSource: IDataSource, value: boolean) => {
  emit('updateActive', dataSource, value)
}

const approve = (dataSource: IDataSource) => {
  emit('approve', dataSource)
}

const handlePageChange = (page: number) => {
  emit('pageChange', page)
}

const handleSortChange = (sortInfo: { column: unknown; prop: string; order: string | null }) => {
  // Map table prop names to DataSourceSortField enum values
  const propToSortFieldMap: Record<string, DataSourceSortField> = {
    externalIdentifier: DataSourceSortField.EXTERNAL_IDENTIFIER,
    title: DataSourceSortField.TITLE,
  }

  const sortField = sortInfo.prop ? propToSortFieldMap[sortInfo.prop] : undefined
  emit('sortChange', { prop: sortField, order: sortInfo.order })
}

const handleFilterChange = (filters: Record<string, any>) => {
  emit('filterChange', filters)
}
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.data-source-table {
  width: 100%;
  overflow-x: auto;
}

.data-source-table :deep(.el-table) {
  min-width: max-content;
}

.data-source-table :deep(.el-table__row) {
  height: auto;
}

.data-source-table :deep(.el-table__cell) {
  padding: 12px 0;
}

.data-source-table :deep(.el-table__body-wrapper .el-table__cell) {
  word-break: break-word;
}

.data-source-table :deep(.el-table__header .el-table__cell) {
  white-space: nowrap;
}

.data-source-table :deep(.el-table__header .cell) {
  white-space: nowrap;
  text-overflow: clip;
  overflow: visible;
}

.expand-container {
  padding: 10px 20px;
}

.data-source-row {
  display: flex;
  border-bottom: 1px solid $gray-500;
  padding: 8px 0;
  min-height: 1.5em;
  align-items: flex-start;
}

.data-source-row.header {
  font-weight: bold;
}

.data-source-col {
  flex: 1;
  padding: 0 10px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}

.language-item {
  margin-bottom: 4px;
  word-wrap: break-word;
}

.operations-cell {
  height: 2em;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
