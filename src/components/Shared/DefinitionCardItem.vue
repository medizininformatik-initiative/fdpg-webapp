<template>
  <template v-if="value === undefined"> - </template>
  <template v-else-if="definition.kind === 'translatable'">
    {{ $t(`${definition.prefix}${value}`) }}
  </template>

  <template v-else-if="definition.kind === 'date'">
    {{ getLocaleDateString(value as string | Date) }}
  </template>

  <template v-else-if="definition.kind === 'boolean'">
    {{ $t(`${definition[value as string]}`) }}
  </template>

  <template v-else-if="definition.kind === 'lookup'">
    {{ definition.lookupMap[value as string][definition.lookupKey] }}
  </template>

  <template v-else>{{ value }}</template>
</template>

<script setup lang="ts">
import type { Definitions } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue'
import { getLocaleDateString } from '@/utils/date.util'

defineProps({
  value: {
    type: [String, Boolean, Number],
    required: true,
  },
  definition: {
    type: Object as PropType<Definitions<any, any>>,
    required: true,
  },
})
</script>
