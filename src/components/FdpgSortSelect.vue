<template>
  <div class="fdpg-sort-select">
    <el-select
      :model-value="sortBy"
      popper-class="fdpg-sort-select-popper"
      placeholder=""
      suffix-icon="arrow-down"
      @change="(e) => $emit('sort-change', e)"
    >
      <template #prefix>
        <span class="placeholder">{{ $t('dashboard.sortBy') }}:</span>
      </template>
      <el-option v-for="({ label, value }, index) in sortOptions" :key="index" :label="$t(label)" :value="value">
        <span class="sort-option-label">{{ $t(label) }}</span>
        <i class="fa fa-check" aria-hidden="true" />
      </el-option>
    </el-select>
    <el-button round type="text" class="sort-order-btn" @click="$emit('sort-order-change')">
      <i class="bi" :class="sortOrder === SortDirection.ASC ? 'bi-arrow-up' : 'bi-arrow-down'" aria-hidden="true" />
    </el-button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { SortDirection } from '@/types/sort-filter.types'

interface IOption {
  label: string
  value: string
}

defineProps({
  sortOptions: {
    type: Array as PropType<IOption[]>,
    default() {
      return []
    },
    validator: (options: IOption[]) => {
      let validate = true
      for (const { label, value } of options) {
        if (label === undefined || value === undefined) {
          validate = false
        }
      }
      return validate
    },
  },
  sortBy: {
    type: String,
    default() {
      return ''
    },
  },
  sortOrder: {
    type: String as PropType<SortDirection>,
    default() {
      return SortDirection.ASC
    },
  },
})

defineEmits(['sort-change', 'sort-order-change'])
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-sort-select {
  border: 1px solid $gray-700;
  border-radius: 3px;
  margin-top: 14px;
  display: flex;
  max-width: 300px;
  width: 100%;

  .placeholder {
    font-size: 18px;
    font-family: 'Titillium Web', serif;
    font-weight: 700;
    height: 42px;
    line-height: 42px;
    color: $gray-700;
    white-space: nowrap;
  }

  .el-select {
    .select-trigger {
      .el-input {
        flex-direction: row-reverse;
        &.is-focus {
          .el-input__wrapper {
            box-shadow: none !important;
          }

          .el-input__inner {
            box-shadow: none !important;
          }
        }

        .el-input__inner {
          font-size: 18px;
          font-family: 'Titillium Web', serif;
          font-weight: 600;
          height: 42px;
          line-height: 42px;
          padding-left: 18px !important;
          padding-right: 0 !important;

          &:focus {
            box-shadow: none !important;
          }
        }

        .el-input__prefix {
          position: relative;
        }
      }
    }
  }

  .sort-order-btn {
    min-height: 42px;
    padding: 7px 12px 7px 0;

    i {
      color: $blue;
    }
  }
}

.fdpg-sort-select-popper {
  border: none !important;
  max-width: 300px;
  width: 100%;

  .el-select-dropdown__list {
    margin: 24px 10px !important;

    .el-select-dropdown__item {
      height: 40px;
      font-size: 16px;
      line-height: 40px;
      margin-bottom: 12px;
      border-radius: 5px;

      &.hover {
        background-color: $gray-100;
      }

      &.selected {
        color: inherit;
        font-weight: 500;

        i {
          visibility: visible;
        }
      }

      i {
        margin-left: 20px;
        color: $blue;
        visibility: hidden;
      }
    }
  }

  .el-popper__arrow {
    display: none;
  }
}
</style>
