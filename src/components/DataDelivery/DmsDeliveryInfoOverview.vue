<template>
  <!-- Pending Delivery Overview start  -->
  <el-collapse>
    <el-collapse-item :key="deliveryInfo._id" v-for="deliveryInfo in dataDelivery?.deliveryInfos ?? []">
      <template #title>
        <div class="delivery-info__el-collapse-item-row">
          <div class="delivery-info__el-collapse-item-title">
            {{ t('dataDelivery.deliveryName', { deliveryName: deliveryInfo.name }) }}
          </div>
          <div v-if="showActions" class="delivery-info__interaction">
            <el-button
              type="primary"
              plain
              class="delivery-info__collapse-buttons"
              @click="() => onCancelDeliveryInfo(deliveryInfo)"
              >{{ t('dataDelivery.cancelDelivery') }}</el-button
            >
            <el-button
              type="primary"
              :disabled="isForwardButtonDisabled(deliveryInfo)"
              class="delivery-info__collapse-buttons"
              @click="() => onForwardDeliveryInfo(deliveryInfo)"
              >{{ t('dataDelivery.forwardDelivery') }}</el-button
            >
          </div>
        </div>
      </template>
      <div class="delivery-info__collapse-body">
        <div class="delivery-info__information">
          <span>{{
            t('dataDelivery.deliveryUntil', { deliveryDate: getLocaleDateString(deliveryInfo.deliveryDate) })
          }}</span>

          <span>
            {{
              t('dataDelivery.lastSynced', {
                lastSynced: getLocaleDateTimeString(deliveryInfo.lastSynced),
              })
            }}
            <el-button
              v-if="showActions"
              type="primary"
              plain
              :icon="RefreshRight"
              @click="async () => await syncDeliveryInfoWithDmst(deliveryInfo)"
              v-bind:loading="loadingIds.has(deliveryInfo._id)"
            />
          </span>
        </div>
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
                class="dms__reset"
                link
                @click="openRateDeliveryDialog"
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
  <div class="delivery-info__buttons" v-if="showActions">
    <el-button
      type="default"
      plain
      :disabled="isNewDmsSelectionAfterDeliveryDisabled"
      data-testid="request-new"
      class="dms__reset"
      link
      @click="openNewDmsDialog"
    >
      {{ t('dataDelivery.newDmsRequestAfterDelivery') }}
    </el-button>
    <el-button type="primary" plain @click="openManualDeliveryDialog">{{ t('dataDelivery.manualEntry') }}</el-button>
    <el-button type="primary" @click="openInitiateDeliveryDialog">{{
      t('dataDelivery.createFurtherDataDelivery')
    }}</el-button>
  </div>
  <!-- Pending Delivery Overview end  -->
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
import { computed, onMounted, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import { RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  dataDelivery: { type: Object as PropType<IDataDelivery>, required: true },
  showActions: { type: Boolean, default: true },
  canRateDelivery: { type: Boolean, default: false },
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

const isNewDmsSelectionAfterDeliveryDisabled = computed(() =>
  (props.dataDelivery?.deliveryInfos || []).some((deliveryInfo) => deliveryInfo.status === DeliveryInfoStatus.PENDING),
)

const syncDeliveryInfoWithDmst = async (deliveryInfo: IDeliveryInfo) => {
  const id = deliveryInfo._id
  loadingIds.value.add(id)

  try {
    if (proposalStore.currentProposal?._id) {
      await proposalStore.syncDeliveryInfo(proposalStore.currentProposal?._id, deliveryInfo)
    }
  } catch (error) {
    console.error('Sync failed:', error)
    showErrorMessage()
  } finally {
    loadingIds.value.delete(id)
  }
}

const onCancelDeliveryInfo = async (deliveryInfo: IDeliveryInfo): Promise<void> => {
  console.log('TODO')
}

const onForwardDeliveryInfo = async (deliveryInfo: IDeliveryInfo): Promise<void> => {
  console.log('TODO')
}

const openNewDmsDialog = () => emit('openDialog:newDms', true)
const openManualDeliveryDialog = () => emit('openDialog:manualDelivery', true)
const openInitiateDeliveryDialog = () => emit('openDialog:initiateDelivery', true)
const openRateDeliveryDialog = () => emit('openDialog:rateDelivery', true)

const isForwardButtonDisabled = (deliveryInfo: IDeliveryInfo): boolean => {
  return deliveryInfo.subDeliveries.every((subDel) => subDel.status === SubDeliveryStatus.PENDING)
}

const isRateDeliveryEnabled = (subDelivery: ISubDelivery): boolean => {
  return subDelivery.status === SubDeliveryStatus.DELIVERED
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
</style>
