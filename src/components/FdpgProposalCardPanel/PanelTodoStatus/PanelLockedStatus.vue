<template>
  <PanelTodoStatus
    :icon-class="stateMap.IS_LOCKED.icon"
    :style-class="stateMap.IS_LOCKED.styleClass"
    :message="stateMap.IS_LOCKED.message"
  />
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import PanelTodoStatus from './PanelTodoStatus.vue'

interface ILockState {
  message: TranslationSchema
  icon: string
  styleClass: string
}

const stateMap: Record<string, ILockState> = {
  IS_LOCKED: {
    message: `proposal.IS_LOCKED`,
    icon: 'fa-solid fa-lock',
    styleClass: 'danger',
  },
}
</script>
