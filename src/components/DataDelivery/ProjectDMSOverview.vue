<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import RequestNewDms from '@/components/DataDelivery/RequestNewDms.vue'

const { t } = useI18n()
const proposalStore = useProposalStore()

const dataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)
</script>

<template>
  <section>
    <h2>{{ t('dataDelivery.dataManagementSiteAbbreviation') }}</h2>

    <MissingDataDeliverySetup v-if="dataDelivery === null || dataDelivery === undefined" />
    <div v-else>
      <DmsRequestOverview />
      <RequestNewDms />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;
</style>
