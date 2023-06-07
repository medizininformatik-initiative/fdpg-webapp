<template>
  <label class="fdpg-label" :class="`fdpg-label--${size}`">
    <span class="label-name">
      <template v-if="htmlFor">
        {{ $t(htmlFor) }}
      </template>
      <template v-else>
        <slot />
      </template>
      <i v-if="required" aria-hidden="true">*</i>
    </span>
    <FdpgInfoPopover v-if="info" :info="info" />
  </label>
</template>

<script setup lang="ts">
import FdpgInfoPopover from '@/components/FdpgInfoPopover.vue'
import type { TranslationSchema } from '@/plugins/i18n'
import type { PropType } from 'vue'

export type LabelSize = 'small' | 'medium' | 'large'

defineProps({
  info: {
    type: String as PropType<TranslationSchema>,
    required: false,
    default: undefined,
  },
  htmlFor: {
    type: String,
    default: undefined,
  },
  required: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String as PropType<LabelSize>,
    default: 'small',
    validator: function (value: string) {
      return ['small', 'medium', 'large'].indexOf(value) !== -1
    },
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-label {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: $gray-900;
  font-weight: 700;

  &.fdpg-label--small {
    line-height: 23px;
    margin-bottom: 8px;

    .label-name {
      font-size: 16px;
    }
  }

  &.fdpg-label--medium {
    margin-bottom: 15px;

    .label-name {
      font-size: 20px;
    }
  }

  &.fdpg-label--large {
    margin-bottom: 22px;

    .label-name {
      font-size: 24px;
    }
  }

  &.focused {
    color: $blue;
  }

  .label-name {
    i {
      margin-left: -2px;
      display: inline-block;
      transform: rotate(5deg);
    }
  }
}
</style>
