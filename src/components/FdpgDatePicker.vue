<template>
  <el-date-picker
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    type="date"
    format="DD/MM/YYYY"
    class="fdpg-date-picker"
    :placeholder="placeholder ? t(placeholder) : ''"
    :disabled-date="disabledDate"
    :disabled="disabled"
    :clearable="clearable"
    :size="size"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ComponentSize } from 'element-plus'
import type { PropType } from 'vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: [String, Date],
    default: undefined,
  },
  placeholder: {
    type: String,
    default: '',
  },
  minDate: {
    type: Date,
    default: () => undefined,
  },
  maxDate: {
    type: Date,
    default: () => undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String as PropType<ComponentSize>,
    default: 'default',
  },
})

const emit = defineEmits(['update:modelValue'])

const disabledDate = (time: Date) => {
  if (props.minDate && props.maxDate) {
    return time <= props.minDate || time >= props.maxDate
  } else if (props.minDate) {
    return time <= props.minDate
  } else if (props.maxDate) {
    return time >= props.maxDate
  } else {
    return false
  }
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-date-picker {
  width: 100% !important;
  height: 59px !important;

  .el-input {
    height: 59px !important;
    position: relative;

    .el-input__wrapper {
      height: 59px;
      color: $black;
      font-size: 18px;
      overflow: hidden;
      white-space: nowrap;
      padding: 0 11px 0 45px;
      text-overflow: ellipsis;
      font-family: 'Titillium Web', serif;
      border: 1px solid $gray-700;
      box-shadow: none;

      &:hover {
        border-color: $blue;
        box-shadow: none;
      }

      &.is-focus {
        transition: 1s;
        font-weight: 600;
        border-width: 2px;
        border-color: $blue;
        padding: 0 10px 0 45px;
        background-color: $gray-100;
        box-shadow: 0 0 10px -5px $blue;
      }

      .el-input__inner {
        height: 59px;
        color: $black;
        font-size: 18px;
        overflow: hidden;
        white-space: nowrap;
        padding: 0;
        text-overflow: ellipsis;
        font-family: 'Titillium Web', serif;
        border: none;
        background: transparent;
      }
    }

    .el-input__suffix {
      position: absolute;
      left: 15px;
      top: 50%;
      transform: translateY(-50%);
      width: auto;
      height: auto;

      .el-input__suffix-inner {
        .el-icon {
          font-size: 17px;
          color: $gray-600;
        }
      }
    }
  }

  .el-input__prefix {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: auto;
    height: auto;

    i {
      font-size: 17px;
      color: $gray-600;
    }
  }

  .el-input__inner {
    height: 59px;
    color: $black;
    font-size: 18px;
    overflow: hidden;
    white-space: nowrap;
    padding: 0 11px 0 45px;
    text-overflow: ellipsis;
    font-family: 'Titillium Web', serif;
    border: 1px solid $gray-700;

    &:hover {
      border-color: $blue;
    }

    &:focus {
      transition: 1s;
      font-weight: 600;
      border-width: 2px;
      border-color: $blue;
      padding: 0 10px 0 45px;
      background-color: $gray-100;
      box-shadow: 0 0 10px -5px $blue;
    }
  }
}

.el-picker__popper {
  .el-picker-panel {
    margin: 0;
  }

  .el-popper__arrow {
    z-index: 0;
  }
}
</style>
