<template>
  {{ dueDatePresentation }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  dueDate: {
    type: Number,
    default: undefined,
  },
})

const { t } = useI18n()
const dueDatePresentation = computed(() => {
  if (props.dueDate) {
    return props.dueDate >= 0
      ? t('dashboard.xDaysLeft', { x: props.dueDate })
      : t('dashboard.xDaysOverdue', { x: -props.dueDate })
  } else {
    return '-'
  }
})
</script>
