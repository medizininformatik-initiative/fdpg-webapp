<template>
  <template v-if="value === undefined && !definition.defaultValue">-</template>
  <template v-else-if="definition.defaultValue && !value">
    {{ t(definition.defaultValue) }}
  </template>
  <template v-else>
    <template v-if="definition.kind === 'translatable'">
      {{ t(`${definition.prefix}${value}`) }}
    </template>

    <template v-else-if="definition.kind === 'date'">
      {{ getLocaleDateString(value as string | Date) }}
    </template>

    <template v-else-if="definition.kind === 'boolean'">
      {{ t(value ? definition.true : definition.false) }}
    </template>

    <template v-else-if="definition.kind === 'lookup'">
      {{ definition.lookupMap[value as string][definition.lookupKey] }}
    </template>

    <div v-else class="ql-editor" v-html="value"></div>
  </template>
</template>

<script setup lang="ts">
import type { Definitions } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue'
import { getLocaleDateString } from '@/utils/date.util'
import { useI18n } from 'vue-i18n'
import { de } from '@/locales'

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

const { t } = useI18n()
</script>
