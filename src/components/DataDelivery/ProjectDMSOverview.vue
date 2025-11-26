<template>
  <section>
    <h2>
      {{
        t(
          isLocationInquiryStep || !isDeliveryInitiated
            ? 'dataDelivery.dataManagementSiteAbbreviation'
            : 'dataDelivery.dataDelivery',
        )
      }}
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
    <template v-else>
      <el-collapse>
        <el-collapse-item v-for="deliveryInfo in dataDelivery?.deliveryInfos ?? []">
          <template #title>
            <div class="delivery-info__el-collapse-item-row">
              <div class="delivery-info__el-collapse-item-title">
                {{ t('dataDelivery.deliveryName', { deliveryName: deliveryInfo.name }) }}
              </div>
              <div class="delivery-info__interaction">
                <el-button type="primary" plain class="delivery-info__collapse-buttons">{{
                  t('dataDelivery.cancelDelivery')
                }}</el-button>
                <el-button
                  type="primary"
                  :disabled="isForwardButtonDisabled(deliveryInfo)"
                  class="delivery-info__collapse-buttons"
                  >{{ t('dataDelivery.forwardDelivery') }}</el-button
                >
              </div>
            </div>
          </template>
          <div class="delivery-info__collapse-body">
            <span>{{
              t('dataDelivery.deliveryUntil', { deliveryDate: getLocaleDateString(deliveryInfo.deliveryDate) })
            }}</span>
            <el-table :data="deliveryInfo.subDeliveries" style="width: 100%">
              <el-table-column :label="t('dataDelivery.deliveryInfoLocation')" style="width: 100%">
                <template #default="tableProps">
                  <p>
                    {{
                      tableProps.row.location
                        ? locationLookupMap[tableProps.row.location]?.display
                        : tableProps.row.location
                    }}
                  </p>
                </template>
              </el-table-column>

              <el-table-column :label="t('dataDelivery.deliveryInfoStatus')">
                <template #default="tableProps">
                  <span class="delivery-info__status">
                    {{ t(`dataDelivery.subdeliveryStatus__${(tableProps.row as IDeliveryInfo).status}`) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column :label="t('dataDelivery.deliveryInfoUpdatedAt')">
                <template #default="tableProps">
                  <p>
                    {{
                      (tableProps.row as IDeliveryInfo).updatedAt ? getLocaleDateString(tableProps.row.updatedAt) : '-'
                    }}
                  </p>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- lower action buttons -->
      <el-button type="primary" plain>{{ t('dataDelivery.manualEntry') }}</el-button>
      <el-button type="primary" @click="() => setInitiateDeliveryDialogOpenState(true)">{{
        t('dataDelivery.createFurtherDataDelivery')
      }}</el-button>
    </template>
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
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { DeliveryAcceptance, type IDeliveryInfo } from '@/types/proposal.types'
import RequestNewDmsDialog from './RequestNewDmsDialog.vue'
import InitiateDeliveryInfoDialog from './InitiateDeliveryInfoDialog.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import useNotifications from '@/composables/use-notifications'
import { getLocaleDateString } from '@/utils/date.util'

const { t } = useI18n()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const { showErrorMessage } = useNotifications()

const locationLookupMap = ref<Record<string, ILocation>>({})

const dataDelivery = computed(() => proposalStore.currentProposal?.dataDelivery)
const selectableLocations = computed(
  () =>
    proposalStore.currentProposal?.userProject.addressees.desiredLocations?.map(
      (loc) => locationLookupMap.value[loc],
    ) ?? [],
)

const isDmsOverrideDialogOpen = ref(false)
const isInitiateDeliveryDialogOpen = ref(false)

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

const isForwardButtonDisabled = (deliveryInfo: IDeliveryInfo): boolean => {
  return false
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

.delivery-info__el-collapse-item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.5em;
  padding-left: unset;
  flex-direction: row;
}

.delivery-info__el-collapse-item-title {
  font-size: 1.25em;
  color: $gray-900;
  font-weight: bold;
}

.delivery-info__collapse-body {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  gap: 1em;
  width: 100%;
}

.delivery-info__collapse-buttons {
  font-size: 1.25em !important;
  padding: 0.5em !important;
}

.delivery-info__status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid $gray-700;
  background: $gray-100;
  color: $black;
  line-height: 1.25rem;

  &[data-variant='FINISHED'] {
    background: $green;
    border-color: $green-100;
  }

  &[data-variant='CANCELED'] {
    background: $red;
    border-color: $red-100;
    color: $white;
  }

  &[data-variant='PENDING'] {
    background: $gray-100;
    border-color: $gray-700;
  }
}
</style>
