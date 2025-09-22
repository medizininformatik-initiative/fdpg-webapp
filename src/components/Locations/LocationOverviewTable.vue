<template>
  <el-table :data="locations" stripe style="width: 100%">
    <el-table-column prop="_id" label="ID" />
    <el-table-column prop="externalCode" label="Code" />
    <el-table-column prop="display" label="Display" />
    <el-table-column prop="contract" label="Contract" />
    <el-table-column prop="deprecated" label="Deprecated" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default>
        <el-button link type="primary" size="small" @click="handleClick">Detail</el-button>
        <el-button link type="primary" size="small">Edit</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import type { ILocation } from '@/types/location.types'
import type { PropType } from 'vue'
import { defineProps } from 'vue'

const props = defineProps({
  locations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
})

const handleClick = () => {}
</script>
