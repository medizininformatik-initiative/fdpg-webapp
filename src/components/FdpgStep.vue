<template>
  <el-step :class="stepIconColor" :title="title" :description="description">
    <template #description>
      <slot />
    </template>
  </el-step>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  stepIconColor: {
    type: String as PropType<'blue' | 'blue-green' | 'medium-green' | 'light-green'>,
    required: false,
    default: 'blue',
  },
})
</script>

<style lang="scss">
@import '../assets/sass/variable';

.el-step {
  color: $body-color;

  &.blue {
    .el-step__icon,
    .el-step__line {
      background: $blue;
    }
  }

  &.blue-green {
    .el-step__icon,
    .el-step__line {
      background: $blue-green;
    }
  }

  &.medium-green {
    .el-step__icon,
    .el-step__line {
      background: $green-400;
    }
  }

  &.light-green {
    .el-step__icon,
    .el-step__line {
      background: $green;
    }
  }

  .el-step__icon {
    color: white;
    border: none;
  }

  .el-step__line {
    top: 30px !important;
    bottom: 5px !important;
    .el-step__line-inner {
      display: none;
    }
  }

  .el-step__title {
    font-size: 16px;
    font-weight: bold;
    color: $body-color;
  }

  .el-step__description {
    margin-bottom: 24px;
    color: $black;
    font-size: 14px;

    p {
      margin: 0;
    }

    .contract-download {
      color: $blue;
      font-size: 14px;
      font-weight: 700;
    }

    .upload-button {
      font-size: 14px;
    }

    .data-volume {
      margin-top: 20px;
      max-width: 400px;
    }

    .el-contracts-list {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      .el-button {
        margin-left: 0;
        min-height: 30px;
      }
    }
  }
}
</style>
