<template>
  <section>
    <h2>{{ t('dataDelivery.dataManagementSiteAbbreviation') }}</h2>

    <template v-if="isLocationInquiryStep">
      <MissingDataDeliverySetup v-if="!dataDelivery" data-testid="missing-dms" />
      <div v-else>
        <DmsRequestOverview data-testid="overview" :data-delivery="dataDelivery" />
        <el-button data-testid="request-new" class="dms__reset" link @click="() => setDialogOpenState(true)">
          {{ t('dataDelivery.newRequest') }}
        </el-button>
      </div>
    </template>
    <template v-else-if="!isDeliveryInitiated">
      <el-card class="dms__card">
        <div class="dms__card__text_row">
          <p class="dms__card_row_header">{{ t('dataDelivery.noDataDeliveryInitiatedHeader') }}</p>
          <p>
            {{
              t('dataDelivery.noDataDeliveryInitiatedBody', {
                dms: locationLookupMap[dataDelivery?.dataManagementSite]?.display,
              })
            }}
          </p>
        </div>

        <div class="dms__card__button_row">
          <el-button @click="() => setDialogOpenState(true)">{{ t('dataDelivery.openSelectDmsDialog') }}</el-button>
          <el-button type="primary" @click="() => initiateNewDelivery()">{{
            t('dataDelivery.createDataDelivery')
          }}</el-button>
        </div>
      </el-card>
    </template>
    <template v-else> Delivery view </template>
  </section>

  <RequestNewDmsDialog
    v-model="isDmsOverrideDialogOpen"
    :data-management-site="dataDelivery?.dataManagementSite ?? null"
    @dialog-open-state="setDialogOpenState"
    @submit="onSelectDms"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { DeliveryAcceptance } from '@/types/proposal.types'
import RequestNewDmsDialog from './RequestNewDmsDialog.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import useNotifications from '@/composables/use-notifications'

const { t } = useI18n()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const { showErrorMessage } = useNotifications()

const locationLookupMap = ref<Record<string, ILocation>>({})

const dataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)

const isDmsOverrideDialogOpen = ref(false)

const isLocationInquiryStep = computed(
  () =>
    !dataDelivery.value ||
    [DeliveryAcceptance.PENDING, DeliveryAcceptance.DENIED].includes(dataDelivery.value?.acceptance),
)

const isDeliveryInitiated = computed(() => !!dataDelivery.value?.delivery && dataDelivery.value.delivery.length > 0)

const setDialogOpenState = (openState: boolean) => {
  isDmsOverrideDialogOpen.value = openState
}

const initiateNewDelivery = () => {
  console.log('TODO: intiate new delivery')
}

const onSelectDms = async (locationId: string) => {
  const proposalId = proposalStore.currentProposal?._id

  if (proposalId !== undefined && proposalId !== '' && locationId !== undefined && locationId !== '') {
    try {
      await proposalStore.updateDmsForDataDelivery(proposalId, locationId)
    } catch {
      showErrorMessage()
    }
  }
}

onMounted(async () => {
  locationLookupMap.value = await locationStore.getLocationLookupMap()
})
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.dms__reset {
  color: $blue;
}

.dms__card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1em;
}

.dms__card_row_header {
  color: $gray-900;
  font-weight: 700;
  line-height: 23px;
  margin-bottom: 8px;
  font-size: 16px;
}

.dms__card__text_row {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dms__card__button_row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>
