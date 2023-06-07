<template>
  <el-popover :width="280" :visible="visible" placement="top-end" popper-class="fdpg-info-popover">
    <template #reference>
      <i
        class="bi-question-circle fdpg-info-popover__ref"
        tabindex="0"
        role="button"
        @keyup.enter="visible = !visible"
        @blur="visible = false"
        @mouseover="visible = true"
        @mouseleave="visible = false"
      />
    </template>
    <template #default>
      <div class="fdpg-tooltip">
        {{ $t(info) }}
      </div>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import type { PropType} from 'vue';
import { ref } from 'vue'
import type { TranslationSchema } from '@/plugins/i18n'

defineProps({
  info: {
    type: String as PropType<TranslationSchema>,
    default: 'general.info',
  },
})

const visible = ref(false)
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
    word-break: break-word;
    text-align: left;

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
