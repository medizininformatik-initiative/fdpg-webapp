<template>
  <el-select
    v-model="selected"
    :placeholder="$t(placeholder)"
    class="fdpg-select"
    :loading="isLoading"
    :loading-text="loadingText ? $t(loadingText) : loadingText"
    :no-data-text="noDataText ? $t(noDataText) : noDataText"
    :disabled="disabled"
  >
    <template #header v-if="shouldDisplayCheckAll">
      <el-checkbox v-model="checkAll" @change="handleCheckAll">
        {{ $t('general.selectAll') }}
      </el-checkbox>
    </template>

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
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { useVModel } from '@vueuse/core'
import type { CheckboxValueType } from 'element-plus'

export interface SelectOption {
  label: string
  value?: string | number
}

const props = defineProps({
  modelValue: {
    type: [Array, String, Number] as PropType<Array<unknown> | string | number | undefined>,
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
  shouldDisplayCheckAll: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
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

    if (props.options.length === (Array.isArray(componentDto.value) ? (componentDto.value.length ?? 0) : -1)) {
      checkAll.value = false
    } else {
      checkAll.value = true
    }
  },
})

const checkAll = ref(false)

const handleCheckAll = (val: CheckboxValueType) => {
  if (val) {
    componentDto.value = props.options.map((_) => _.value)
  } else {
    componentDto.value = []
  }
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

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
