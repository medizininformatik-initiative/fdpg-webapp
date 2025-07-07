<template>
  <template v-if="dto[card.key] && !card.shouldHide && (!card.loopOn || dto[card.key][card.loopOn]?.length)">
    <component :is="headline" v-if="card.cardLabel"
      ><span v-if="number">{{ number }}. </span>{{ t(card.cardLabel) }}</component
    >
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
</template>

<script setup lang="ts">
import DefinitionCard from '@/components/Shared/DefinitionCard.vue'
import type { DefinitionCards, DefinitionCardsVirtual } from '@/components/Shared/definition-card.types'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps({
  dto: {
    type: Object as PropType<any>,
    required: true,
  },
  card: {
    type: Object as PropType<DefinitionCards<any, any> | DefinitionCardsVirtual<any, any>>,
    required: true,
  },
  number: {
    type: String,
    default: '',
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
