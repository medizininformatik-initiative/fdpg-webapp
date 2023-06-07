<template>
  <component :is="headline" v-if="card.cardLabel">{{ $t(card.cardLabel) }}</component>
  <template v-if="card.loopOn">
    <DefinitionCard
      v-for="(item, itemIdx) in dto[card.key][card.loopOn]"
      :key="'item' + itemIdx"
      :card="card"
      :dto="item"
      class="print-region"
    ></DefinitionCard>
  </template>
  <DefinitionCard v-else :card="card" :dto="dto"></DefinitionCard>
</template>

<script setup lang="ts">
import DefinitionCard from '@/components/Shared/DefinitionCard.vue'
import type { DefinitionCards, DefinitionCardsVirtual } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue'

defineProps({
  dto: {
    type: Object as PropType<any>,
    required: true,
  },
  card: {
    type: Object as PropType<DefinitionCards<any, any> | DefinitionCardsVirtual<any, any>>,
    required: true,
  },
  headline: {
    type: String,
    default: 'h3',
  },
})
</script>

<style lang="scss">
h3 {
  break-after: avoid;
}
</style>
