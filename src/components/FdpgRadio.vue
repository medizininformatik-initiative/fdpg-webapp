<template>
  <div class="fdpg-radio-wrapper" :class="{ 'fdpg-radio__info--visible': info }">
    <el-radio class="fdpg-radio" :label="value" :data-testId="'radio-option_' + value + testIdExtension">
      <template v-if="label">
        {{ $t(label) }}
      </template>
      <slot v-else />
    </el-radio>
    <FdpgInfoPopover v-if="info" :info="info" />
  </div>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import FdpgInfoPopover from '@/components/FdpgInfoPopover.vue'
import type { PropType } from 'vue'

defineProps({
  testIdExtension: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: undefined,
  },
  info: {
    type: String as PropType<TranslationSchema>,
    required: false,
    default: undefined,
  },
  value: {
    type: [String, Boolean, Number],
    required: true,
  },
})
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-radio-wrapper {
  display: inline-block;
  margin: 0 10px 10px 0;

  &.fdpg-radio__info--visible {
    display: flex;
    align-items: center;

    .fdpg-radio {
      margin-right: 10px;
    }
  }
  .fdpg-radio {
    border-radius: 5px;
    display: inline-flex;
    margin: 0 10px 10px 0;
    padding: 20px 17px 16px;
    background-color: $gray-100;

    &:focus-within {
      outline: $blue auto 1px;
      outline-offset: 3px;
    }
    &.is-checked {
      background-color: $green;

      .el-radio__input {
        .el-radio__inner {
          border-color: $gray-200;
          background-color: $gray-200;

          &::after {
            border-color: $green;
            transform: rotate(45deg) scaleY(1);
          }
        }
      }

      .el-radio__label {
        color: $white;
      }
    }

    &:last-child {
      margin-right: 0;
    }

    .el-radio__input {
      .el-radio__inner {
        width: 18px;
        height: 18px;
        color: $gray-900;
        border-radius: 4px;
        background-color: $gray-200;
        border: 2px solid $gray-900;

        &::after {
          top: 0;
          left: 5px;
          width: 3px;
          height: 10px;
          border: 1px solid $white;
          border-top: 0;
          border-left: 0;
          position: absolute;
          border-radius: unset;
          box-sizing: content-box;
          transform-origin: center;
          background-color: $gray-100;
          transform: rotate(45deg) scaleY(0);
          transition: transform 0.15s ease-in 50ms;
        }
      }
    }

    .el-radio__label {
      color: $black;
      font-size: 18px;
    }
  }
}
</style>
