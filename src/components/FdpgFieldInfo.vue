<template>
  <el-popover :width="280" trigger="hover" placement="top-end" popper-class="fdpg-info-popover">
    <template #reference>
      <i class="bi-question-circle fdpg-info-popover__ref" aria-hidden="true" />
    </template>
    <template #default>
      <div class="fdpg-tooltip">
        {{ $t(info) }}
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'

defineProps({
  info: {
    type: String as PropType<TranslationSchema>,
    default: 'general.info',
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-info-popover__ref {
  font-size: 19px;
  cursor: pointer;
}

.fdpg-info-popover {
  &.el-popper {
    border: none;
    color: $white;
    padding: 20px;
    font-size: 16px;
    max-width: 320px;
    line-height: 24px;
    border-radius: 18px;
    background-color: $blue;
    right: -40px !important;
    bottom: 8px !important;

    .el-popper__arrow {
      &::before {
        width: 20px;
        height: 20px;
        bottom: -5px;
        border-color: $blue;
        left: -45px !important;
        background-color: $blue;
      }
    }
  }
}
</style>
