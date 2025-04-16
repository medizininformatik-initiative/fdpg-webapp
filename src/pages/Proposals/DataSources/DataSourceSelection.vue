<template>
  <div>
    <FdpgLabel htmlFor="sidebar.DataSources" :required="true" size="large"> </FdpgLabel>
    <DataSourceItem
      v-for="(item, index) in dataSources"
      :key="index"
      :dataSource="item"
      :isSelected="selectedDataSource === item"
      @select="selectDataSource(item)"
      @deselect="deselectDataSource(item)"
    />
  </div>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import DataSourceItem from './DataSourceItem.vue'
import { ref } from 'vue'
import type { IDataSource } from '@/types/proposal.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

const dataSources: IDataSource[] = [
  {
    id: PlatformIdentifier.DIFE,
    title: 'proposal.dife_title',
    description: 'proposal.dife_description',
    externalLink: 'proposal.dife_link',
  },
  {
    id: PlatformIdentifier.Mii,
    title: 'proposal.mii_title',
    description: 'proposal.mii_description',
    externalLink: 'proposal.mii_link',
  },
]
const selectedDataSource = ref(null)
const selectDataSource = (dataSource: IDataSource) => {}
const deselectDataSource = (dataSource: IDataSource) => {}
</script>

<style scoped></style>
