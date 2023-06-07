<template>
  <div class="fdpg-archive-page">
    <FdpgProposalCardPanel :panel="panel" />
  </div>
</template>

<script setup lang="ts">
import FdpgProposalCardPanel from '@/components/FdpgProposalCardPanel/FdpgProposalCardPanel.vue'
import { useLayoutStore } from '@/stores/layout.store'
import { CardType } from '@/types/component.types'
import type { PanelType } from '@/types/proposal.types'
import { PanelQuery } from '@/types/sort-filter.types'
import { onMounted } from 'vue'

const panel: PanelType = { type: CardType.Archive, header: 'general.archive', query: PanelQuery.Archived }

const layoutStore = useLayoutStore()

onMounted(() => {
  layoutStore.setBreadcrumbs([])
})
</script>

<style lang="scss">
.fdpg-archive-page {
  margin-top: 10px;
}
</style>
