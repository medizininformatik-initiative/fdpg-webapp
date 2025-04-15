<template>
  <section class="section" v-if="checklist">
    <h2 class="section-title">
      {{ $t('proposal.checklistTitle') }}
    </h2>
    <ElCard>
      <ElRow>
        <ElCol :span="24">
          <FdpgInternalCheckNote
            :currentNote="props.checklist?.fdpgInternalCheckNotes"
            @update:listItem="($event: InternalCheckNote) => emit('update:listItem', $event)"
          ></FdpgInternalCheckNote>
        </ElCol>
      </ElRow>
    </ElCard>

    <section role="region" class="section__checklist">
      <ElCard>
        <div class="checklist">
          <el-collapse v-model="activeName">
            <el-collapse-item :title="table.title" :name="table.title" v-for="table in tables" :key="table.title">
              <template #title>
                <h3 tabindex="0" role="button">
                  <span
                    class="indicator"
                    :class="[
                      table.tableData?.filter((item) => item.isAnswered).length === table.tableData?.length
                        ? 'green'
                        : table.indicator,
                    ]"
                  ></span
                  >{{
                    $t(`proposal.${table.title}`, {
                      checkedCount: table.tableData?.filter((item) => item.isAnswered).length,
                      optionsCount: table.tableData?.length,
                    })
                  }}
                </h3>
              </template>
              <section class="box-wrapper">
                <FdpgCheckListTable
                  :tableData="table.tableData"
                  @update:listItem="(event: IChecklistItem) => emit('update:listItem', event)"
                ></FdpgCheckListTable>
              </section>
            </el-collapse-item>
          </el-collapse>
        </div>
      </ElCard>
    </section>

    <el-checkbox
      v-model="checklist.isRegistrationLinkSent"
      @change="updateChecklist('isRegistrationLinkSent', $event)"
      class="fdpg-checkbox"
      :size="FdpgInputSize.Small"
    >
      {{ $t('proposal.isRegistrationLinkSentLabel') }}
    </el-checkbox>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type PropType } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { FdpgInputSize } from '@/types/component.types'
import {
  ProposalStatus,
  type IChecklistItem,
  type IFdpgChecklist,
  type InternalCheckNote,
} from '@/types/proposal.types'
import FdpgCheckListTable from './FdpgCheckListTable.vue'
import { ElCard, ElCol, ElRow, ElCheckbox, ElCollapse, ElCollapseItem } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object as PropType<Record<string, boolean>>,
    required: true,
  },

  checklist: {
    type: Object as PropType<IFdpgChecklist | undefined>,
    required: true,
  },

  title: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },
  status: {
    type: String as PropType<ProposalStatus>,
    required: true,
  },
})
const tables = computed(() => {
  return [
    {
      tableData: props.checklist?.projectProperties,
      title: 'projectProperties',
      indicator: 'gray',
    },
    {
      tableData: props.checklist?.checkListVerification,
      title: 'checklistVerification',
      indicator: 'gray',
    },
  ]
})

const emit = defineEmits(['update:listItem'])

const activeName = ref<string>('projectProperties')

const updateChecklist = (key: string, value: any) => {
  if (props.checklist && key in props.checklist) {
    emit('update:listItem', { [key]: value })
  }
}

onMounted(() => {
  if (
    props.status === ProposalStatus.FdpgCheck &&
    props.checklist?.checkListVerification.every((item) => item.isAnswered)
  )
    activeName.value = 'checklistVerification'
  else if (props.status === ProposalStatus.LocationCheck) activeName.value = ''
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
@use 'sass:color';
.section {
  &__checklist {
    margin: 2rem 0;
  }
}
.checklist {
  padding: 20px;
  border-radius: 10px;
  background-color: $gray-200;

  h3 {
    font-size: 20px;

    .indicator {
      width: 8px;
      height: 8px;
      display: inline-block;
      border-radius: 50%;
      margin: 0 0.5rem 0.2rem 0;

      &.green {
        background-color: $green;
      }
      &.blue {
        background-color: $blue;
      }
      &.red {
        background-color: $red-100;
      }
      &.gray {
        background-color: $gray-900;
      }
    }
  }

  .box-wrapper {
    box-shadow: 0px 2px 10px rgba(106, 116, 132, 0.2);
    background: $white;
  }
  :deep(.el-collapse) {
    .el-collapse-item__header {
      background-color: transparent;
      color: inherit;
      margin-bottom: 2px;
      padding-left: 6px;

      &:focus-within {
        outline: $blue auto 1px;
      }

      h3 {
        outline: none;
      }
    }

    .el-collapse-item:not(:last-child) {
      margin-bottom: 1rem;
    }
    .el-collapse-item__wrap {
      background: transparent;
    }

    .el-collapse-item__content {
      color: inherit;

      tr:has(> td.el-table__expand-column) {
        &:focus-within {
          outline: $blue auto 1px;
        }
      }
    }

    .el-table__inner-wrapper::after,
    .el-table__inner-wrapper::before,
    .el-table::before {
      display: none;
    }
  }

  .no-location-placeholder {
    color: $blue;
    font-weight: 600;
    text-align: center;
    padding: 0.5rem 0;
  }

  .show-more {
    color: $blue;
    font-weight: 800;
    text-align: center;
    padding-top: 0.5rem;
    font-size: 16px;
    cursor: pointer;

    i {
      margin-left: 0.5rem;
      &:focus {
        outline: $blue auto 1px;
      }
    }
  }

  .contract-conditions {
    margin-top: 1rem;
    padding: 0 0 1rem 0;

    h3 {
      padding: 1rem 0 0 1rem;
      display: flex;
      align-items: center;
      i {
        background-color: $gray-800;
        color: $white;
        border-radius: 50%;
        width: 2.2rem;
        height: 2.2rem;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        margin-right: 1rem;
      }
    }

    .contract-condition-row {
      display: flex;
      justify-content: space-between;

      padding: 0 12px;
      line-height: 24px;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }

      .condition-text {
        font-size: 16px;
        color: $blue;
        font-weight: 600;
      }

      .cursor-pointer {
        cursor: pointer;
      }
      .condition-interaction {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .condition-data-amount {
        display: flex;
        align-items: center;
        gap: 2rem;
        color: $green;
      }
      .condition-status {
        border-radius: 5px;
        padding: 1px 12px;
        border: 1px solid;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;

        &.pending {
          background-color: color.adjust($gray-900, $lightness: 50%);
          border-color: $gray-900;
        }

        &.accepted {
          background-color: color.adjust($green, $lightness: 50%);
          border-color: $green;
        }

        &.rejected {
          background-color: color.adjust($red-100, $lightness: 40%);
          border-color: $red-100;
          color: $black;
        }
      }

      .el-collapse-item {
        width: 100%;
      }

      .el-collapse-item-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding-right: 1em;
      }

      .condition-row {
        margin-bottom: unset;
      }
    }

    .contract-condition-collapse-parent {
      flex-direction: column;
    }

    .condition-actions {
      .el-button {
        padding: 0;
        width: 2rem;
        min-height: 1rem;
        background-color: $gray-200;
        border: none;
        color: $blue;

        i {
          font-size: 1.2rem;
        }

        &:last-child {
          margin-left: 10px;
        }

        &.pending:hover {
          &.positive {
            background-color: $green;
          }
          &.negative {
            background-color: $red-100;
          }

          i {
            color: $white;
          }
        }

        &.accepted {
          background-color: transparent;
          i {
            color: $green;
          }

          &.negative {
            visibility: hidden;
          }
        }

        &.rejected {
          background-color: transparent;
          i {
            color: $red-100;
          }

          &.positive {
            visibility: hidden;
          }
        }
      }
    }
  }

  .decline-reason {
    padding: 0 2rem;

    &__data {
      padding: 0 1rem;
      dt {
        font-weight: bold;
      }
    }
  }

  :deep(.el-table__expand-icon--expanded) {
    outline-offset: -3px;
  }
}
</style>
