<template>
  <div class="fdpg-checkbox-wrapper" :class="{ 'fdpg-checkbox__info--visible': info }">
    <el-checkbox class="fdpg-checkbox" :label="value" :size="size" :data-testId="'checkbox__' + value">
      <template v-if="label">
        {{ $t(label) }}
      </template>
      <slot v-else />
    </el-checkbox>
    <FdpgInfoPopover v-if="info" :info="info" />
  </div>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import FdpgInfoPopover from '@/components/FdpgInfoPopover.vue'
import type { PropType } from 'vue'
import { FdpgInputSize } from '@/types/component.types'

defineProps({
  label: {
    type: String,
    required: false,
    default: undefined,
  },
  size: {
    type: String as PropType<FdpgInputSize>,
    default() {
      return FdpgInputSize.Default
    },
  },
  info: {
    type: String as PropType<TranslationSchema>,
    required: false,
    default: undefined,
  },
  value: {
    type: String,
    required: true,
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-checkbox-wrapper {
  display: inline-block;
  margin: 0 10px 10px 0;

  &.fdpg-checkbox__info--visible {
    display: flex;
    align-items: center;

    .fdpg-checkbox {
      margin-right: 10px;

      &.is-checked {
        .el-checkbox__label {
          color: $white;
        }
      }
    }
  }
}
</style>
