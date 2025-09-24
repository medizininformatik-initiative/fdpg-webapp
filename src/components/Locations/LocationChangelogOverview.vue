<template>
  <el-table :data="changelogs" stripe style="width: 100%">
    <el-table-column type="expand">
      <template #default="expandProps">
        <div class="expand-container">
          <div class="comparison-row header">
            <div class="comparison-col"><strong>Field</strong></div>
            <div class="comparison-col"><strong>Old Value</strong></div>
            <div class="comparison-col"><strong>New Value</strong></div>
          </div>

          <div v-for="key in comparisionKeys" :key="key" class="comparison-row">
            <div class="comparison-col">{{ key }}</div>
            <div class="comparison-col">{{ expandProps.row.oldLocationData?.[key] }}</div>
            <div
              :class="
                'comparison-col' +
                ' ' +
                getDifferenceClass(expandProps.row.oldLocationData?.[key], expandProps.row.newLocationData?.[key])
              "
            >
              {{ expandProps.row.newLocationData?.[key] }}
            </div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="forCode" label="Code" width="80px" />
    <el-table-column label="Display">
      <template #default="expandProps">
        <p>{{ expandProps.row.newLocationData?.display }}</p>
      </template>
    </el-table-column>
    <el-table-column prop="status" label="Status" />
    <el-table-column prop="strategy" label="Strategy" />
    <el-table-column prop="created" label="Date" />
    <el-table-column fixed="right" label="Operations" min-width="120">
      <template #default="operationProps">
        <div v-if="operationProps.row.status === LocationSyncChangeLogStatus.PENDING">
          <el-button
            link
            type="primary"
            size="small"
            @click="setStatus(operationProps.row._id, LocationSyncChangeLogStatus.APPROVED)"
            >Approve</el-button
          >
          <el-button
            link
            type="primary"
            size="small"
            @click="setStatus(operationProps.row._id, LocationSyncChangeLogStatus.DECLINED)"
            >Decline</el-button
          >
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { LocationSyncChangeLogStatus, type ILocation, type ILocationSyncChangelog } from '@/types/location.types'
import type { PropType } from 'vue'

const props = defineProps({
  changelogs: {
    type: Array as PropType<ILocationSyncChangelog[]>,
    required: true,
  },
})

const emit = defineEmits(['setStatus'])

type ComparisionKeys = keyof Omit<ILocation, 'rubrum'>
const comparisionKeys: ComparisionKeys[] = [
  '_id',
  'externalCode',
  'display',
  'definition',
  'consortium',
  'contract',
  'abbreviation',
  'uri',
  'dataIntegrationCenter',
  'dataManagementCenter',
  'deprecationDate',
  'deprecated',
]

const getDifferenceClass = (oldVal: any, newVal: any) => {
  return oldVal === newVal ? '' : 'highlight-difference'
}

const setStatus = async (changelogId: string, status: LocationSyncChangeLogStatus) => {
  const changelog = props.changelogs.find((c) => c._id === changelogId)
  console.log({ changelog })
  emit('setStatus', changelog, status)
}
</script>

<style scoped>
.expand-container {
  padding: 10px 20px;
}
.comparison-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 0;
}
.comparison-row.header {
  font-weight: bold;
}
.comparison-col {
  flex: 1;
  padding: 0 10px;
}
.highlight-difference {
  font-weight: bolder;
}
</style>
