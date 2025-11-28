<template>
  <section v-if="isLocationInquiryStep || !isDeliveryInitiated">
    <h2>
      {{ t('dataDelivery.dataManagementSiteAbbreviation') }}
    </h2>

    <template v-if="isLocationInquiryStep">
      <MissingDataDeliverySetup v-if="!dataDelivery" data-testid="missing-dms" />
      <div v-else>
        <DmsRequestOverview data-testid="overview" :data-delivery="dataDelivery" />
        <el-button data-testid="request-new" class="dms__reset" link @click="() => setNewDmsDialogOpenState(true)">
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
          <el-button @click="() => setNewDmsDialogOpenState(true)">{{
            t('dataDelivery.openSelectDmsDialog')
          }}</el-button>
          <el-button type="primary" @click="() => setInitiateDeliveryDialogOpenState(true)">{{
            t('dataDelivery.createDataDelivery')
          }}</el-button>
        </div>
      </el-card>
    </template>
  </section>
  <section v-else>
    <h2>
      {{ t('dataDelivery.dataDelivery') }}
    </h2>
    <DmsDeliveryInfoOverview
      v-if="dataDelivery"
      :data-delivery="dataDelivery"
      @open-dialog:new-dms="setNewDmsDialogOpenState"
      @open-dialog:manual-delivery="setManualDeliveryInfoEntryDialogOpen"
      @open-dialog:initiate-delivery="setInitiateDeliveryDialogOpenState"
    />
    <div v-else>Data delivery not set</div>
  </section>

  <RequestNewDmsDialog
    v-model="isDmsOverrideDialogOpen"
    :data-management-site="dataDelivery?.dataManagementSite ?? null"
    @dialog-open-state="setNewDmsDialogOpenState"
    @submit="onSelectDms"
  />

  <InitiateDeliveryInfoDialog
    v-model="isInitiateDeliveryDialogOpen"
    :selectable-locations="selectableLocations"
    @dialog-open-state="setInitiateDeliveryDialogOpenState"
    @submit="initiateNewDeliveryInfo"
  />

  <!-- Manual Delivery Info Dialog -->
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { DeliveryAcceptance, type IDeliveryInfo } from '@/types/proposal.types'
import RequestNewDmsDialog from './RequestNewDmsDialog.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import useNotifications from '@/composables/use-notifications'
import InitiateDeliveryInfoDialog from './InitiateDeliveryInfoDialog.vue'
import DmsDeliveryInfoOverview from './DmsDeliveryInfoOverview.vue'

const { t } = useI18n()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const { showErrorMessage } = useNotifications()

const locationLookupMap = ref<Record<string, ILocation>>({})

const dataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)
const selectableLocations = computed(
  () =>
    proposalStore.currentProposal?.userProject?.addressees?.desiredLocations?.map(
      (loc) => locationLookupMap.value[loc],
    ) ?? [],
)

const isDmsOverrideDialogOpen = ref(false)
const isInitiateDeliveryDialogOpen = ref(false)
const isManualDeliveryInfoEntryDialogOpen = ref(false)

const isLocationInquiryStep = computed(
  () =>
    !dataDelivery.value ||
    [DeliveryAcceptance.PENDING, DeliveryAcceptance.DENIED].includes(dataDelivery.value?.acceptance),
)

const isDeliveryInitiated = computed(
  () => !!dataDelivery.value?.deliveryInfos && dataDelivery.value.deliveryInfos.length > 0,
)

const setNewDmsDialogOpenState = (openState: boolean) => {
  isDmsOverrideDialogOpen.value = openState
}

const setInitiateDeliveryDialogOpenState = (openState: boolean) => {
  isInitiateDeliveryDialogOpen.value = openState
}

const setManualDeliveryInfoEntryDialogOpen = (openState: boolean) => {
  isManualDeliveryInfoEntryDialogOpen.value = openState
}

const initiateNewDeliveryInfo = async (newDeliveryInfo: IDeliveryInfo) => {
  if (!proposalStore.currentProposal?._id) {
    return
  }

  try {
    proposalStore.initiateDeliveryInfo(proposalStore.currentProposal?._id, newDeliveryInfo)
  } catch (e) {
    console.error(e)
    showErrorMessage()
  }
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
