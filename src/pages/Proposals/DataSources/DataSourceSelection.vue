<template>
  <div>
    <FdpgLabel htmlFor="sidebar.DataSources" :required="true" size="large"> </FdpgLabel>
    <div class="data-source-container">
      <DataSourceItem
        v-for="(item, i) in dataSources"
        :key="i"
        :dataSource="item"
        :platformIdentifier="i"
        :isSelected="isDataSourceSelected(i)"
        @change="handleDataSourceChange(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import DataSourceItem from './DataSourceItem.vue'
import type { IDataSourceDto } from '@/types/proposal.types'
import { onMounted, ref, defineExpose, computed } from 'vue'
import { useConfigStore } from '@/stores/config/config.store'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Array as () => PlatformIdentifier[],
    required: true,
  },
})
const emit = defineEmits(['update:modelValue'])

const selectedSources = useVModel(props, 'modelValue', emit)
const configStore = useConfigStore()

const dataSources = computed<IDataSourceDto>(() => {
  return configStore.dataSources
})

const isDataSourceSelected = (dataSource: PlatformIdentifier) => {
  return selectedSources.value.includes(dataSource)
}

const handleDataSourceChange = (dataSource: PlatformIdentifier) => {
  if (!isDataSourceSelected(dataSource)) {
    selectedSources.value.push(dataSource)

    emit('update:modelValue', selectedSources.value)
  }
}

const loadDataSources = async () => {
  await configStore.getDataSources()
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
