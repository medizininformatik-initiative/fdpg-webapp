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
import { onMounted, ref, defineExpose } from 'vue'
import { useConfigStore } from '@/stores/config/config.store'

const props = defineProps({
  modelValue: {
    type: Array as () => IDataSource[],
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])

const selectedSources = ref<IDataSource[]>([])
const configStore = useConfigStore()
const dataSources = ref<IDataSource[]>([])

const isDataSourceSelected = (item: IDataSource) => {
  if (!item || !item._id) return false
  return selectedSources.value.some((ds) => ds._id === item._id)
}

const handleDataSourceChange = (dataSource: IDataSource) => {
  if (!isDataSourceSelected(dataSource)) {
    const newSelectedSources = [...selectedSources.value]
    newSelectedSources.push({
      ...dataSource,
    })

    selectedSources.value = newSelectedSources

    emit('update:modelValue', newSelectedSources)
  }
}

const loadDataSources = async () => {
  dataSources.value = await configStore.getDataSources()
}

onMounted(async () => {
  await loadDataSources()
})

// Expose method for testing
defineExpose({
  loadDataSources,
})
</script>

<style scoped lang="scss">
.data-source-container {
  display: flex;
  flex-direction: column;
}
</style>
