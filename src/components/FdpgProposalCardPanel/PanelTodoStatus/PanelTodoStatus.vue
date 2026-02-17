<template>
  <p class="todo-status" :class="styleClass">
    <span class="icon" :class="iconClass" aria-hidden="true" />
    <span>{{ $t(message) }}</span>
  </p>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import type { PropType } from 'vue'

defineProps({
  styleClass: {
    type: String,
    required: true,
  },
  iconClass: {
    type: String,
    required: true,
  },
  message: {
    type: String as PropType<TranslationSchema>,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.todo-status {
  .icon {
    margin: 0 0.5rem 0 0;
  }
  &.danger {
    color: $error;
  }

  &.pending {
    color: $gray-900;
  }

  &.active {
    color: $blue;
    font-weight: 600;
  }

  &.success {
    color: $gray-900;
    font-weight: 600;
  }
}
</style>
