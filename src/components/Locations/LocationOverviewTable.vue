<template>
  <el-table :data="locs" row-key="_id" stripe style="width: 100%" v-loading="loading">
    <el-table-column type="expand">
      <template #default="expandProps">
        <div class="expand-container">
          <div class="location-row header">
            <div class="location-col">
              <strong>{{ t('general.field') }}</strong>
            </div>
            <div class="location-col">
              <strong>{{ t('general.value') }}</strong>
            </div>
          </div>

          <div v-for="key in readonlyKeys" :key="key" class="location-row">
            <div class="location-col">{{ key }}</div>
            <div :class="'location-col'">
              {{ expandProps.row?.[key] }}
            </div>
          </div>
          <div v-for="key in editableKeys" :key="key" class="location-row">
            <div class="location-col">{{ key }}</div>
            <div :class="'location-col'">
              <FdpgTextEditor v-model="expandProps.row[key]" @blur="updateLocation(expandProps.row)" />
            </div>
          </div>
        </div>
      </template>
    </el-table-column>

    <el-table-column prop="_id" label="ID" />
    <el-table-column prop="externalCode" label="Code" />
    <el-table-column prop="display" label="Display" />
    <el-table-column prop="contract" label="Contract" />
    <el-table-column prop="deprecated" label="Deprecated" />
  </el-table>
</template>

<script lang="ts" setup>
import type { ILocation } from '@/types/location.types'
import type { PropType } from 'vue'
import { computed, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgTextEditor from '../FdpgTextEditor.vue'

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

// remove refrence for update check on changes
const locs = computed(() => props.locations.map((loc) => ({ ...loc })))

const { t } = useI18n()

type LocationKeys = keyof ILocation
const readonlyKeys: LocationKeys[] = [
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
const editableKeys: LocationKeys[] = ['rubrum']

const emit = defineEmits(['updateLocation'])

const updateLocation = (updatedLocation: ILocation) => {
  const persistedLoc = props.locations.find((loc) => loc._id === updatedLocation._id)
  console.log({ persistedLoc, updatedLocation })
  if (editableKeys.every((k) => updatedLocation[k] === persistedLoc?.[k])) {
    return
  }

  emit('updateLocation', updatedLocation)
}
</script>

<style scoped>
.expand-container {
  padding: 10px 20px;
}
.location-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  padding: 8px 0;
}
.location-row.header {
  font-weight: bold;
}
.location-col {
  flex: 1;
  padding: 0 10px;
}
</style>
