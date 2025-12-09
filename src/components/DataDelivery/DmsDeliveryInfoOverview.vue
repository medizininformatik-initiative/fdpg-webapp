<template>
  <!-- Pending Delivery Overview start  -->
  <el-collapse>
    <el-collapse-item :key="deliveryInfo._id" v-for="deliveryInfo in dataDelivery?.deliveryInfos ?? []">
      <template #title>
        <div class="delivery-info__el-collapse-item-row">
          <div class="delivery-info__el-collapse-item-title">
            {{ t('dataDelivery.deliveryName', { deliveryName: deliveryInfo.name }) }}
          </div>
          <div
            v-if="canInitiateDms && deliveryInfo.status === DeliveryInfoStatus.PENDING"
            class="delivery-info__interaction"
          >
            <el-button
              type="primary"
              plain
              class="delivery-info__collapse-buttons"
              @click.stop="() => setCancelDeliveryDialogOpen(true, deliveryInfo)"
              >{{ t('dataDelivery.cancelDelivery') }}</el-button
            >
            <el-button
              type="primary"
              :disabled="isForwardButtonDisabled(deliveryInfo)"
              class="delivery-info__collapse-buttons"
              @click.stop="() => setForwardDeliveryDialogOpen(true, deliveryInfo)"
              >{{ t('dataDelivery.forwardDelivery') }}</el-button
            >
          </div>
        </div>
      </template>
      <div class="delivery-info__collapse-body">
        <div class="delivery-info__information">
          <p v-if="deliveryInfo.status === DeliveryInfoStatus.PENDING">
            {{ t('dataDelivery.deliveryUntil', { deliveryDate: getLocaleDateString(deliveryInfo.deliveryDate) }) }}
          </p>
          <p v-if="deliveryInfo.status === DeliveryInfoStatus.CANCELED">
            {{
              t('dataDelivery.deliveryWasCanceled', { canceledDate: getLocaleDateString(deliveryInfo.forwardedOnDate) })
            }}
          </p>
          <div v-if="deliveryInfo.status === DeliveryInfoStatus.WAITING_FOR_DATA_SET">
            <p>
              {{
                t('dataDelivery.waitingForDataSet', {
                  forwardedDate: getLocaleDateString(deliveryInfo.forwardedOnDate),
                })
              }}
            </p>
            <p>
              {{ t('dataDelivery.forwardedOn', { forwardedDate: getLocaleDateString(deliveryInfo.forwardedOnDate) }) }}
            </p>
          </div>
          <div v-if="deliveryInfo.status === DeliveryInfoStatus.FINISHED">
            <p>
              {{ t('dataDelivery.forwardedOn', { forwardedDate: getLocaleDateString(deliveryInfo.forwardedOnDate) }) }}
            </p>
            <a
              v-if="deliveryInfo.resultUrl"
              link
              :href="deliveryInfo.resultUrl"
              target="_blank"
              class="delivery-info__result-url"
              >{{ deliveryInfo.resultUrl }}</a
            >
          </div>

          <span
            v-if="
              !deliveryInfo.manualEntry &&
              [DeliveryInfoStatus.PENDING, DeliveryInfoStatus.WAITING_FOR_DATA_SET].includes(deliveryInfo.status)
            "
          >
            {{
              t('dataDelivery.lastSynced', {
                lastSynced: getLocaleDateTimeString(deliveryInfo.lastSynced),
              })
            }}
            <el-button
              v-if="canInitiateDms"
              type="primary"
              plain
              :icon="RefreshRight"
              @click="async () => await syncDeliveryInfoWithDmst(deliveryInfo)"
              v-bind:loading="loadingIds.has(deliveryInfo._id)"
            />
          </span>
        </div>
        <el-table :data="deliveryInfo.subDeliveries">
          <el-table-column :label="t('dataDelivery.deliveryInfoLocation')">
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
              <span class="delivery-info__sub-status" :data-variant="(tableProps.row as ISubDelivery).status">
                {{ t(`dataDelivery.subdeliveryStatus__${(tableProps.row as ISubDelivery).status}`) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column :label="t('dataDelivery.deliveryInfoUpdatedAt')">
            <template #default="tableProps">
              <p>
                {{ (tableProps.row as ISubDelivery).updatedAt ? getLocaleDateString(tableProps.row.updatedAt) : '-' }}
              </p>
            </template>
          </el-table-column>

          <el-table-column>
            <template #default="tableProps">
              <el-button
                v-if="canRateDelivery"
                type="default"
                plain
                :disabled="!isRateDeliveryEnabled(tableProps.row as ISubDelivery)"
                data-testid="request-new"
                link
                @click="setRateDeliveryDialogOpen(true, deliveryInfo, tableProps.row as ISubDelivery)"
              >
                {{ t('dataDelivery.rateDelivery') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-collapse-item>
  </el-collapse>

  <!-- lower action buttons -->
  <div class="delivery-info__buttons">
    <el-button
      v-if="canInitiateDms"
      type="default"
      plain
      :disabled="isNewDmsSelectionAfterDeliveryDisabled"
      data-testid="request-new"
      link
      @click="openNewDmsDialog"
    >
      {{ t('dataDelivery.newDmsRequestAfterDelivery') }}
    </el-button>
    <el-button v-if="canManualInitiate" type="primary" plain @click="openManualDeliveryDialog">{{
      t('dataDelivery.manualEntry')
    }}</el-button>
    <el-button v-if="canInitiateDsfDelivery" type="primary" @click="openInitiateDeliveryDialog">{{
      t('dataDelivery.createFurtherDataDelivery')
    }}</el-button>
  </div>
  <!-- Pending Delivery Overview end  -->

  <!-- Dialogs start -->

  <FdpgDialog
    v-if="selectedDeliveryInfo"
    :model-value="isForwardDeliveryDialogOpen"
    :title="
      t('dataDelivery.forwardDeliveryTitle', {
        deliveryName: selectedDeliveryInfo?.name,
      })
    "
    :message="
      t('dataDelivery.forwardDeliveryMessage', {
        dmsDisplay: locationLookupMap[selectedDeliveryInfo?.dms]?.display,
      })
    "
  >
    <template #footer>
      <el-button plain link @click="setForwardDeliveryDialogOpen(false)">{{ t('general.cancel') }}</el-button>
      <el-button
        type="primary"
        @click="
          setDeliveryInfoStatus(
            selectedDeliveryInfo,
            DeliveryInfoStatus.WAITING_FOR_DATA_SET,
            setForwardDeliveryDialogOpen,
          )
        "
        >{{ t('general.forwardDeliveryDialogForwardButton') }}</el-button
      >
    </template>
  </FdpgDialog>

  <FdpgDialog
    v-if="selectedDeliveryInfo"
    :model-value="isCancelDeliveryDialogOpen"
    :title="
      t('dataDelivery.cancelDeliveryDialogTitle', {
        deliveryName: selectedDeliveryInfo?.name,
      })
    "
    :message="
      t('dataDelivery.cancelDeliveryDialogMessage', {
        dmsDisplay: locationLookupMap[selectedDeliveryInfo?.dms]?.display,
      })
    "
  >
    <template #footer>
      <el-button plain link @click="setCancelDeliveryDialogOpen(false)">{{ t('general.cancel') }}</el-button>
      <el-button
        type="primary"
        @click="setDeliveryInfoStatus(selectedDeliveryInfo, DeliveryInfoStatus.CANCELED, setCancelDeliveryDialogOpen)"
        >{{ t('dataDelivery.cancelDeliveryDialogCancelButton') }}</el-button
      >
    </template>
  </FdpgDialog>

  <RateSubDeliveryDialog
    v-if="selectedSubDelivery?.deliveryInfo && selectedSubDelivery.subDelivery && canRateDelivery"
    :model-value="isRateDeliveryDialogOpen"
    @close-dialog="setRateDeliveryDialogOpen(false)"
    @submit="onRateSubDelivery"
  />
  <!-- Dialogs end -->
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useLocationStore } from '@/stores/locations/location.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ILocation } from '@/types/location.types'
import {
  DeliveryInfoStatus,
  SubDeliveryStatus,
  type IDataDelivery,
  type IDeliveryInfo,
  type ISubDelivery,
} from '@/types/proposal.types'
import { getLocaleDateString, getLocaleDateTimeString } from '@/utils/date.util'
import { computed, onMounted, ref, type PropType, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshRight } from '@element-plus/icons-vue'
import RateSubDeliveryDialog from './RateSubDeliveryDialog.vue'
import FdpgDialog from '../FdpgDialog.vue'

const props = defineProps({
  dataDelivery: { type: Object as PropType<IDataDelivery>, required: true },
  canInitiateDms: { type: Boolean, default: false },
  canRateDelivery: { type: Boolean, default: false },
  canManualInitiate: { type: Boolean, default: false },
  canInitiateDsfDelivery: { type: Boolean, default: false },
})

const emit = defineEmits([
  'openDialog:manualDelivery',
  'openDialog:initiateDelivery',
  'openDialog:newDms',
  'openDialog:rateDelivery',
])

const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const { showErrorMessage } = useNotifications()
const { t } = useI18n()

const loadingIds = ref(new Set())
const locationLookupMap = ref<Record<string, ILocation>>({})

const isForwardDeliveryDialogOpen = ref(false)
const isCancelDeliveryDialogOpen = ref(false)
const isRateDeliveryDialogOpen = ref(false)

const selectedDeliveryInfo: Ref<IDeliveryInfo | null> = ref(null)
const selectedSubDelivery: Ref<{ deliveryInfo: IDeliveryInfo; subDelivery: ISubDelivery } | null> = ref(null)

const isNewDmsSelectionAfterDeliveryDisabled = computed(() =>
  (props.dataDelivery?.deliveryInfos || []).some((deliveryInfo) =>
    [DeliveryInfoStatus.PENDING, DeliveryInfoStatus.WAITING_FOR_DATA_SET].includes(deliveryInfo.status),
  ),
)

const syncDeliveryInfoWithDmst = async (deliveryInfo: IDeliveryInfo) => {
  const id = deliveryInfo._id
  loadingIds.value.add(id)

  try {
    if (proposalStore.currentProposal?._id) {
      await proposalStore.syncDeliveryInfo(proposalStore.currentProposal?._id, deliveryInfo)
    }
  } catch (error) {
    showErrorMessage('dataDelivery.syncFailed')
  } finally {
    loadingIds.value.delete(id)
  }
}

const openNewDmsDialog = () => emit('openDialog:newDms', true)
const openManualDeliveryDialog = () => emit('openDialog:manualDelivery', true)
const openInitiateDeliveryDialog = () => emit('openDialog:initiateDelivery', true)

const isForwardButtonDisabled = (deliveryInfo: IDeliveryInfo): boolean => {
  return !deliveryInfo.subDeliveries.some((subDel) => subDel.status === SubDeliveryStatus.ACCEPTED)
}

const isRateDeliveryEnabled = (subDelivery: ISubDelivery): boolean => {
  return [SubDeliveryStatus.DELIVERED, SubDeliveryStatus.REPEATED].includes(subDelivery.status)
}

const setForwardDeliveryDialogOpen = (openState: boolean, deliveryInfo?: IDeliveryInfo) => {
  if (openState && !deliveryInfo) {
    showErrorMessage()
    return
  }

  selectedDeliveryInfo.value = deliveryInfo ?? null
  isForwardDeliveryDialogOpen.value = openState
}

const setCancelDeliveryDialogOpen = (openState: boolean, deliveryInfo?: IDeliveryInfo) => {
  if (openState && !deliveryInfo) {
    showErrorMessage()
    return
  }

  selectedDeliveryInfo.value = deliveryInfo ?? null
  isCancelDeliveryDialogOpen.value = openState
}

const setRateDeliveryDialogOpen = (openState: boolean, deliveryInfo?: IDeliveryInfo, subDelivery?: ISubDelivery) => {
  if (openState && (!deliveryInfo || !subDelivery)) {
    showErrorMessage()
    return
  }

  selectedSubDelivery.value = deliveryInfo && subDelivery ? { deliveryInfo: deliveryInfo, subDelivery } : null
  isRateDeliveryDialogOpen.value = openState
}

const setDeliveryInfoStatus = async (
  deliveryInfo: IDeliveryInfo | null,
  newStatus: DeliveryInfoStatus,
  closeDialogFn: (openState: boolean) => void,
) => {
  if (!deliveryInfo) {
    showErrorMessage()
    return
  }

  try {
    if (proposalStore.currentProposal?._id) {
      await proposalStore.setDeliveryInfoStatus(proposalStore.currentProposal?._id, {
        ...deliveryInfo,
        status: newStatus,
      })
    }
  } catch (error) {
    showErrorMessage(t('dataDelivery.setStatusFailed', { deliveryName: deliveryInfo.name }))
  } finally {
    closeDialogFn(false)
  }
}

const onRateSubDelivery = async (rating: SubDeliveryStatus): Promise<void> => {
  const { deliveryInfo, subDelivery } = selectedSubDelivery.value ?? {}
  if (!deliveryInfo?._id || !subDelivery?._id || !rating) {
    showErrorMessage()
    return
  }

  if (!proposalStore.currentProposal?._id) {
    return
  }

  try {
    await proposalStore.rateSubDelivery(proposalStore.currentProposal._id, deliveryInfo._id, {
      ...subDelivery,
      status: rating,
    })
  } catch (e) {
    showErrorMessage()
  } finally {
    setRateDeliveryDialogOpen(false)
  }
}

onMounted(async () => {
  locationLookupMap.value = await locationStore.getLocationLookupMap()
})
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

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

.delivery-info__information {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.delivery-info__buttons {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1em;
}

.delivery-info__sub-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid $gray-700;
  background: $gray-100;
  color: $black;
  line-height: 1.25rem;

  &[data-variant='PENDING'] {
    background: $gray-100;
    border-color: $gray-700;
  }

  &[data-variant='REPEATED'] {
    background: $gray-100;
    border-color: $gray-700;
  }

  &[data-variant='DELIVERED'] {
    color: $white;
    border-color: $blue;
    background: $blue-100;
  }

  &[data-variant='ACCEPTED'] {
    background: $green;
    border-color: $green-100;
  }

  &[data-variant='CANCELED'] {
    background: $red;
    border-color: $red-100;
    color: $white;
  }
}

.delivery-info__result-url {
  color: $blue;
}
</style>
