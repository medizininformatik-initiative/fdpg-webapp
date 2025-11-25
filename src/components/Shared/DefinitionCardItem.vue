<template>
  <template v-if="value === undefined && !definition.defaultValue"><span class="ql-editor">-</span></template>
  <template v-else-if="definition.defaultValue && !value">
    {{ t(definition.defaultValue) }}
  </template>
  <template v-else>
    <template v-if="definition.kind === 'translatable'">
      <div class="card-item-value">{{ t(`${definition.prefix}${value}`) }}</div>
    </template>

    <template v-else-if="definition.kind === 'date'">
      <div class="card-item-value">{{ getLocaleDateString(value as string | Date) }}</div>
    </template>

    <template v-else-if="definition.kind === 'boolean'">
      <div class="card-item-value">{{ t(value ? definition.true : definition.false) }}</div>
    </template>

    <template v-else-if="definition.kind === 'lookup'">
      <div class="card-item-value">
        {{
          definition.lookupMap[value as string]?.[definition.lookupKey] ?? `error on ${value}.${definition?.lookupKey}`
        }}
      </div>
    </template>

    <template v-else-if="definition.kind === 'table' && Array.isArray(value)">
      <el-table :data="value" style="width: 100%">
        <el-table-column
          v-for="column in definition.columns"
          :key="column.key"
          :prop="column.key"
          :label="t(column.label)"
        />
      </el-table>
    </template>

    <div v-else class="ql-editor" v-html="value"></div>
  </template>
</template>

<script setup lang="ts">
import type { Definitions } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue'
import { getLocaleDateString } from '@/utils/date.util'
import { useI18n } from 'vue-i18n'

defineProps({
  value: {
    type: [String, Number, Boolean, Date, Array, Object] as PropType<
      string | number | boolean | Date | any[] | Record<string, any>
    >,
    required: true,
  },
  definition: {
    type: Object as PropType<Definitions<any, any>>,
    required: true,
  },
})

const { t } = useI18n()
</script>
<style scoped>
.card-item-value {
  padding: 12px 15px;
}
</style>
