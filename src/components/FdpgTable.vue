<template>
  <h3 class="title">{{ t(tableHeader, { count: proposals.length }) }}</h3>
  <div :class="['table-wrapper', { 'overview-mode': isOverviewMode }]">
    <el-table
      :data="proposals"
      :default-sort="{ prop: 'address', order: 'descending' }"
      :height="fullHeight ? '100%' : 312"
      :class="['fdpg-table', { 'full-width': isOverviewMode }]"
      :table-layout="isOverviewMode ? 'auto' : 'fixed'"
      role="table"
      :tabindex="proposals.length > 0 ? '0' : '-1'"
      @current-change="handleRowClick"
      @row-click="handleRowClick"
      @keydown.down="focusNextRow($event)"
      @keydown.up="focusPreviousRow($event)"
      @keydown.prevent.tab="handleTableTab($event)"
      @keydown.tab.shift="handleShiftTab($event)"
      @keydown.space="handleTableSpace($event)"
      @keydown.esc="handleTableEsc($event)"
      @blur="removeTableBodyListeners($event)"
    >
      <el-table-column
        v-for="(column, index) of columns"
        :key="index"
        :sortable="column.sortable"
        :prop="column.prop"
        :width="isOverviewMode ? undefined : column.width"
      >
        <template #header
          ><span
            :tabindex="proposals.length > 0 ? '0' : '-1'"
            class="columnHeader"
            @keydown.enter="toggleSort($event)"
            @keydown.left="focusPreviousColumnHeader($event)"
            @keydown.right="focusNextColumnHeader($event)"
            @keydown.prevent.tab="handleTableTab($event)"
            >{{ t(column.header) }}</span
          ></template
        >
        <template v-if="column.type === ColumnType.Tag" #default="scope">
          <el-tag tabindex="0" @keydown.self.enter="handleRowClick(scope.row, $event)" @focus="handleFocus($event)">{{
            getNestedProperty(scope.row, column.prop)
          }}</el-tag>
        </template>
        <template v-else-if="column.type === ColumnType.Date" #default="scope">
          {{
            getNestedProperty(scope.row, column.prop)
              ? new Date(getNestedProperty(scope.row, column.prop)).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              : '-'
          }}
        </template>

        <template v-else-if="column.type === ColumnType.DueDate" #default="scope">
          <FdpgTableDueDateRow :due-date="getNestedProperty(scope.row, column.prop)" />
        </template>

        <template v-else-if="column.type === ColumnType.Status" #default="scope">
          {{ getStatusFilter(getNestedProperty(scope.row, column.prop)) }}
        </template>

        <template v-else-if="column.type === ColumnType.ProjectStatus" #default="scope">
          {{ getNestedProperty(scope.row, column.prop) }}
        </template>

        <template v-else-if="column.type === ColumnType.ProjectSubstatus" #default="scope">
          {{ t(`projectStatus.SUBSTATUS__${getNestedProperty(scope.row, column.prop)}`) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { Role } from '@/types/oidc.types'
import { ProposalStatus, type PanelType } from '@/types/proposal.types'
import { RouteName } from '@/types/route-name.enum'
import { PanelQuery, SortDirection } from '@/types/sort-filter.types'
import useTableAccessibility from '@/composables/use-table-accessibility'
import { ElTable } from 'element-plus'
import type { PropType } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import FdpgTableDueDateRow from './FdpgTableDueDateRow.vue'
import { useI18n } from 'vue-i18n'

enum ColumnType {
  Tag = 'tag',
  DueDate = 'dueDate',
  Date = 'date',
  Status = 'status',
  ProjectStatus = 'projectStatus',
  ProjectSubstatus = 'projectSubstatus',
}

interface IColumn {
  prop: string
  header: string
  type?: ColumnType
  sortable?: boolean
  width?: string
}

const router = useRouter()

const props = defineProps({
  panel: {
    type: Object as PropType<PanelType>,
    required: true,
  },
  columns: {
    type: Array as PropType<IColumn[]>,
    required: true,
  },
  userRole: {
    type: String as PropType<Role>,
    required: true,
  },
  tableHeader: {
    type: String,
    required: true,
  },
  clickActionDisabled: {
    type: Boolean,
    default: false,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['row-click'])

const { t } = useI18n()

const defaultLength = ref<number>(6)
const displayCount = ref<number>(defaultLength.value)

const proposalStore = useProposalStore()

const fetchProposals = async () => {
  displayCount.value = defaultLength.value
  try {
    await proposalStore.fetch({ order: SortDirection.DESC, panelQuery: props.panel.query })
  } catch (error) {
    console.log('TODO: Handle Error', error)
  }
}

const handleRowClick = async (row, event?: Event | KeyboardEvent) => {
  if (props.clickActionDisabled) {
    return
  }

  await router.push({
    name: RouteName.ProposalDetails,
    params: { id: row._id },
  })
  if (event instanceof KeyboardEvent) {
    event.preventDefault()
  }
}
const proposalStatusMap: Record<string, string[]> = {
  [t('general.requested')]: [ProposalStatus.FdpgCheck, ProposalStatus.Rework],
  [t('general.pending')]: [ProposalStatus.LocationCheck, ProposalStatus.Contracting],
  [t('general.current')]: [
    ProposalStatus.ExpectDataDelivery,
    ProposalStatus.DataResearch,
    ProposalStatus.FinishedProject,
    ProposalStatus.DataCorrupt,
  ],
}
const getStatusFilter = (statusTitle: string): string | undefined => {
  return Object.keys(proposalStatusMap).find((key) => (proposalStatusMap[key].includes(statusTitle) ? key : ''))
}

const {
  handleFocus,
  focusNextRow,
  focusPreviousRow,
  handleTableTab,
  handleShiftTab,
  handleTableSpace,
  handleTableEsc,
  removeTableBodyListeners,
  focusPreviousColumnHeader,
  focusNextColumnHeader,
  toggleSort,
} = useTableAccessibility()

const getNestedProperty = (obj: any, path: string) => {
  const keys = path.replace(/\[([^\]]+)\]/g, '.$1').split('.')
  return keys.reduce((current, key) => current?.[key], obj)
}

const proposals = computed(() => proposalStore.filteredProposal[props.panel.query] || [])

const isOverviewMode = computed(() => props.panel.query === PanelQuery.FdpgOverview)

onMounted(async () => {
  fetchProposals()
})

watch([props], () => {
  fetchProposals()
})
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-table {
  width: 100%;

  &:focus {
    outline: $blue auto 1px;
    outline-offset: 3px;
  }

  .el-table__header {
    margin-top: 5px;
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 20px;

    tr {
      padding: 2px;
      &:focus-visible {
        outline: $blue auto 1px;
        outline-offset: 3px;
      }
    }

    .el-table__cell {
      padding-bottom: 10px;

      .cell {
        font-weight: 600;
        font-size: 16px;
        color: $gray-900;

        &:focus-within {
          outline: $blue auto 1px;
        }

        .columnHeader {
          outline: none;
        }
      }
    }
  }

  .el-table__body {
    margin: 4px;
    margin-left: 10px;

    &:focus {
      outline: #5a79ae auto 1px;
      outline-offset: 3px;
    }
    .el-table__row {
      margin-bottom: 10px;

      &:focus-within {
        outline: $blue auto 1px;
        outline-offset: 1px;
      }

      &:hover {
        .el-table__cell {
          background-color: $gray-200;
        }
      }

      .el-table__cell {
        flex: auto;
        padding: 14px 0;
        border-bottom: none;
        margin-top: 2px;

        &:first-child {
          border-bottom-left-radius: 10px;
          border-top-left-radius: 10px;
        }

        &:last-child {
          border-bottom-right-radius: 10px;
          border-top-right-radius: 10px;
        }

        .cell {
          font-size: 16px;
          color: $black;
          white-space: nowrap;

          .el-tag {
            background-color: $gray-800;
            color: $white;
            border-width: 0;
            margin-right: 3px;
            font-size: 14px;
            padding: 1px 13px 0;
            height: 23px;
            &:focus {
              outline: none;
            }
          }
        }
      }
    }
  }
}

.table-wrapper {
  width: 100%;

  &.overview-mode {
    overflow-x: auto;
    width: 100%;

    .fdpg-table {
      min-width: 100%;
      width: max-content;
      table-layout: auto;

      .el-table__header,
      .el-table__body {
        width: max-content;
        table-layout: auto;
      }

      .el-table__header-wrapper,
      .el-table__body-wrapper {
        overflow: visible;
      }

      .el-table__cell {
        width: auto;
        min-width: max-content;

        .cell {
          white-space: nowrap;
          overflow: visible;
          text-overflow: clip;
        }
      }
    }
  }
}

.title {
  font-size: 20px;
  margin-top: 34px;
  margin-bottom: 27px;
}
</style>
