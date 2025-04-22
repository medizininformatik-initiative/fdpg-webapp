<template>
  <div>
    <FdpgLabel htmlFor="sidebar.DataSources" :required="true" size="large"> </FdpgLabel>
    <div class="data-source-container">
      <DataSourceItem
        v-for="item in dataSources"
        :key="item._id"
        :dataSource="item"
        :isSelected="isDataSourceSelected(item)"
        @change="handleDataSourceChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import DataSourceItem from './DataSourceItem.vue'
import type { IDataSource } from '@/types/proposal.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array as () => IDataSource[],
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])

const selectedSources = ref<IDataSource[]>([])

function initializeSelectedSources() {
  const validSources = Array.isArray(props.modelValue) ? props.modelValue.filter((ds) => ds && ds._id) : []

  selectedSources.value = validSources.map((ds) => ({
    ...ds,
    _id: typeof ds._id === 'string' ? ds._id : String(ds._id),
  }))
}

initializeSelectedSources()

const isDataSourceSelected = (item: IDataSource) => {
  if (!item || !item._id) return false
  return selectedSources.value.some((ds) => ds._id === item._id)
}

watch(
  () => props.modelValue,
  () => {
    initializeSelectedSources()
  },
  { deep: true },
)

const handleDataSourceChange = (event: { dataSource: IDataSource }) => {
  const { dataSource } = event

  // Safety check
  if (!dataSource || !dataSource._id) {
    console.warn('Received data source without ID', dataSource)
    return
  }

  if (!isDataSourceSelected(dataSource)) {
    const newSelectedSources = [...selectedSources.value]
    newSelectedSources.push({
      ...dataSource,
      _id: typeof dataSource._id === 'string' ? dataSource._id : String(dataSource._id),
    })

    selectedSources.value = newSelectedSources

    emit('update:modelValue', newSelectedSources)
  }
}

const dataSources: IDataSource[] = [
  {
    _id: '1',
    tag: PlatformIdentifier.DIFE,
    title: 'proposal.dife_title',
    description: 'proposal.dife_description',
    externalLink: 'proposal.dife_link',
  },
  {
    _id: '2',
    tag: PlatformIdentifier.Mii,
    title: 'proposal.mii_title',
    description: 'proposal.mii_description',
    externalLink: 'proposal.mii_link',
  },
]
</script>

<style scoped lang="scss">
.data-source-container {
  display: flex;
  flex-direction: column;
}
</style>
