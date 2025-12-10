<template>
  <section v-if="isLocationInquiryStep && userRole === Role.FdpgMember">
    <h2>
      {{ t('dataDelivery.dataManagementSiteAbbreviation') }}
    </h2>

    <div v-if="dataDelivery">
      <DmsRequestOverview data-testid="overview" :data-delivery="dataDelivery" />
      <el-button data-testid="request-new" class="dms__reset" link @click="() => setNewDmsDialogOpenState(true)">
        {{ t('dataDelivery.newRequest') }}
      </el-button>
    </div>
    <MissingDataDeliverySetup v-else data-testid="missing-dms" />
  </section>

  <section v-else-if="!isDeliveryInitiated && userRole === Role.FdpgMember">
    <h2>
      {{ t('dataDelivery.dataManagementSiteAbbreviation') }}
    </h2>
    <el-card class="dms__card">
      <div class="dms__card__text_row">
        <p class="dms__card_row_header">{{ t('dataDelivery.noDataDeliveryInitiatedHeader') }}</p>
        <p>
          {{
            t('dataDelivery.noDataDeliveryInitiatedBody', {
              dms: locationLookupMap[dataDelivery!.dataManagementSite]?.display,
            })
          }}
        </p>
      </div>

      <div class="dms__card__button_row">
        <el-button @click="() => setNewDmsDialogOpenState(true)">{{ t('dataDelivery.openSelectDmsDialog') }}</el-button>
        <el-button type="primary" @click="() => setInitiateDeliveryDialogOpenState(true)">{{
          t('dataDelivery.createDataDelivery')
        }}</el-button>
      </div>
    </el-card>
  </section>

  <section v-else-if="isDeliveryInitiated">
    <h2>
      {{ t('dataDelivery.dataDelivery') }}
    </h2>
    <DmsDeliveryInfoOverview
      :data-delivery="dataDelivery!"
      :can-initiate-dms="userRole === Role.FdpgMember"
      :can-manual-initiate="userRole === Role.FdpgMember || userRole === Role.DataManagementOffice"
      :can-initiate-dsf-delivery="userRole === Role.FdpgMember"
      :can-rate-delivery="userRole === Role.DataManagementOffice"
      :can-fetch-results="userRole === Role.Researcher"
      @open-dialog:new-dms="setNewDmsDialogOpenState"
      @open-dialog:manual-delivery="setManualDeliveryInfoEntryDialogOpen"
      @open-dialog:initiate-delivery="setInitiateDeliveryDialogOpenState"
    />
  </section>

  <RequestNewDmsDialog
    v-model="isDmsOverrideDialogOpen"
    :data-management-site="dataDelivery?.dataManagementSite ?? null"
    @dialog-open-state="setNewDmsDialogOpenState"
    @submit="onSelectDms"
  />

  <InitiateDeliveryInfoDialog
    v-if="dataDelivery"
    v-model="isInitiateDeliveryDialogOpen"
    :selectable-locations="selectableLocations"
    :selected-dms="dataDelivery.dataManagementSite"
    @dialog-open-state="setInitiateDeliveryDialogOpenState"
    @submit="initiateNewDeliveryInfo"
  />

  <InitiateDeliveryInfoDialog
    v-if="dataDelivery"
    v-model="isManualDeliveryInfoEntryDialogOpen"
    :selectable-locations="selectableLocations"
    :selected-dms="dataDelivery.dataManagementSite"
    :manual-creation="true"
    @dialog-open-state="setManualDeliveryInfoEntryDialogOpen"
    @submit="initiateNewDeliveryInfo"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref, type Ref } from 'vue'
import { useProposalStore } from '@/stores/proposal/proposal.store.ts'
import MissingDataDeliverySetup from '@/components/DataDelivery/MissingDataDeliverySetup.vue'
import DmsRequestOverview from '@/components/DataDelivery/DmsRequestOverview.vue'
import { DeliveryAcceptance, type IDataDelivery, type IDeliveryInfo } from '@/types/proposal.types'
import RequestNewDmsDialog from './RequestNewDmsDialog.vue'
import { useLocationStore } from '@/stores/locations/location.store'
import type { ILocation } from '@/types/location.types'
import useNotifications from '@/composables/use-notifications'
import InitiateDeliveryInfoDialog from './InitiateDeliveryInfoDialog.vue'
import DmsDeliveryInfoOverview from './DmsDeliveryInfoOverview.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'

const { t } = useI18n()
const proposalStore = useProposalStore()
const locationStore = useLocationStore()
const authStore = useAuthStore()
const { showErrorMessage } = useNotifications()

const locationLookupMap = ref<Record<string, ILocation>>({})

const userRole = computed(() => authStore.singleKnownRole)

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
  () =>
    !!dataDelivery.value?.deliveryInfos &&
    dataDelivery.value.deliveryInfos.length > 0 &&
    dataDelivery.value.dataManagementSite,
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
    await proposalStore.initiateDeliveryInfo(proposalStore.currentProposal?._id, newDeliveryInfo)
  } catch (e) {
    showErrorMessage('dataDelivery.errorInitiateDeliveryInfo')
  }
}

const onSelectDms = async (locationId: string) => {
  const proposalId = proposalStore.currentProposal?._id

  if (proposalId !== undefined && proposalId !== '' && locationId !== undefined && locationId !== '') {
    try {
      await proposalStore.updateDmsForDataDelivery(proposalId, {
        ...(dataDelivery.value || {}),
        deliveryInfos: [...(dataDelivery.value?.deliveryInfos ? dataDelivery.value.deliveryInfos : [])],
        dataManagementSite: locationId,
        acceptance: DeliveryAcceptance.PENDING,
      } as IDataDelivery)
    } catch {
      showErrorMessage('dataDelivery.errorSelectDms')
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
