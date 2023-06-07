<template>
  <el-select
    v-model="selected"
    :placeholder="$t(placeholder)"
    class="fdpg-select"
    :loading="isLoading"
    :loading-text="loadingText ? $t(loadingText) : loadingText"
    :no-data-text="noDataText ? $t(noDataText) : noDataText"
  >
    <el-option
      v-for="({ label, value }, index) in options"
      :key="index + '_' + value"
      :label="label"
      :value="value"
      :data-testId="'option__' + value + testIdExtension"
    />
  </el-select>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { computed } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { useVModel } from '@vueuse/core'

export interface SelectOption {
  label: string
  value?: string | number
}

const props = defineProps({
  modelValue: {
    type: [Array, String, Number],
    default: undefined,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  testIdExtension: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String as PropType<TranslationSchema>,
    default: undefined,
  },
  noDataText: {
    type: String as PropType<TranslationSchema>,
    default: undefined,
  },
  options: {
    type: Array as PropType<SelectOption[]>,
    default() {
      return []
    },
    validator: (options: SelectOption[]) => {
      let validate = true
      for (const { label, value } of options) {
        if (label === undefined || value === undefined) {
          validate = false
        }
      }
      return validate
    },
  },
})

const emit = defineEmits(['update:modelValue'])

const componentDto = useVModel(props, 'modelValue', emit)

const selected = computed({
  get() {
    return componentDto.value
  },
  set(values) {
    if (values === '') {
      componentDto.value = undefined
    } else {
      componentDto.value = values
    }
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-select {
  width: 100% !important;
  border: 0 !important;

  .el-form-item.is-error & {
    .el-input__inner,
    .el-input__inner:hover {
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
      border-color: var(--el-color-danger);
    }
  }

  :hover {
    .el-input__inner {
      box-shadow: 0 0 0 1px $gray-700 inset !important;
      border-color: $gray-700;
    }
  }

  .el-input {
    &.is-focus {
      .el-input__inner {
        font-weight: 600;
        border-width: 2px;
        border-color: $blue;
        padding: 0 35px 0 10px;
        background-color: $gray-100;
        box-shadow: 0 0 10px -5px $blue;
      }
    }

    .el-input__inner {
      height: 59px;
      color: $black;
      font-size: 18px;
      overflow: hidden;
      white-space: nowrap;
      padding: 0 35px 0 11px;
      text-overflow: ellipsis;
      font-family: 'Titillium Web', serif;
      border: 1px solid $gray-700;

      &:hover {
        box-shadow: 0 0 0 1px var(--el-input-hover-border-color) inset;
      }
    }

    .el-input__suffix {
      .el-input__suffix-inner {
        i {
          font-size: 18px;
          font-weight: 600;
          color: $gray-900;
          line-height: 60px;
        }
      }
    }
  }

  .el-select__tags {
    & > span {
      display: flex;
      flex-wrap: wrap;

      .el-tag {
        height: 40px;
      }
    }
  }
}

.el-select__popper {
  &.el-popper[role='tooltip'] {
    border: none;

    .el-popper__arrow {
      display: none;
    }
  }
}
</style>
