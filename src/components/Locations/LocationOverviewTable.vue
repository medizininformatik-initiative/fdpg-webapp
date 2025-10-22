<template>
  <el-table :data="locations" stripe style="width: 100%" v-loading="loading">
    <el-table-column prop="_id" label="ID" />
    <el-table-column prop="externalCode" label="Code" />
    <el-table-column prop="display" label="Display" />
    <el-table-column prop="contract" label="Contract" />
    <el-table-column prop="deprecated" label="Deprecated" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">{{ t('general.details') }}</el-button>
        <el-button link type="primary" size="small">{{ t('general.edit') }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import type { ILocation } from '@/types/location.types'
import type { PropType } from 'vue'
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  locations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    default: true,
  },
})

const { t } = useI18n()

const handleClick = () => {}
</script>
