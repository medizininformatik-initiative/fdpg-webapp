<template>
  <el-input
    ref="inputRef"
    v-model="value"
    class="fdpg-input"
    :size="size"
    :placeholder="t(placeholder as TranslationSchema)"
    @blur="handleBlur"
    @focus="handleFocus"
    :disabled="isDisabled"
  />
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { FdpgInputSize } from '@/types/component.types'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  placeholder: {
    type: String as PropType<TranslationSchema>,
    default: 'general.info',
  },
  size: {
    type: String as PropType<FdpgInputSize>,
    default: FdpgInputSize.Default,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

const inputRef = ref()
defineExpose({
  inputRef,
})

const value = ref('')

const handleFocus = (e: FocusEvent) => {
  const classList = (e.target as HTMLInputElement)?.parentElement?.previousSibling?.classList as DOMTokenList
  classList?.add('focused')
}

const handleBlur = (e: FocusEvent) => {
  const classList = (e.target as HTMLInputElement)?.parentElement?.previousSibling?.classList as DOMTokenList
  classList?.remove('focused')
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.fdpg-input {
  &.el-input--small {
    .el-input__inner {
      height: 40px;
      background-color: $gray-100;
      font-size: 16px;

      &:focus {
        border: 2px solid $blue;
        padding: 0 18px;
        font-weight: 500;
        transition-property: border-color;
      }
    }
    .el-textarea__inner {
      height: 40px;
      background-color: $gray-100;
      font-size: 16px;

      &:focus {
        border: 2px solid $blue;
        font-weight: 500;
        transition-property: border-color;
      }
    }
  }

  .el-input__inner {
    height: 59px;
    color: $black;
    padding: 0 11px;
    font-size: 18px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-family: 'Titillium Web', serif;
    border: 1px solid $gray-700;

    &:focus {
      padding: 0 10px;
      font-weight: 600;
      border-width: 2px;
      border-color: $blue;
      background-color: $gray-100;
      box-shadow: 0 0 10px -5px $blue;
      transition: 1s;
      transition-property: background-color;
    }
  }

  .el-textarea__inner {
    min-height: 59px !important;
    color: $black;
    padding: 14px 11px;
    font-size: 18px;
    overflow: hidden;
    white-space: pre-wrap;
    text-overflow: ellipsis;
    font-family: 'Titillium Web', serif;
    border: 1px solid $gray-700;

    &:focus {
      padding: 13px 10px;
      font-weight: 600;
      border-width: 2px;
      border-color: $blue;
      background-color: $gray-100;
      box-shadow: 0 0 10px -5px $blue;
      transition: 1s;
      transition-property: background-color;
    }
  }
}
</style>
