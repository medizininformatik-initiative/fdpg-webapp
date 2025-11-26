<template>
  <FdpgDialog
    :title="t('dataDelivery.initiateDataDeliveryTitle')"
    v-model="dialogVisible"
    @close="() => setDialogOpen(false)"
  >
    <p>{{ t('dataDelivery.initiateDataDeliveryText') }}</p>
    <form class="dms__form" @submit.prevent="handleSubmit">
      <FdpgFormItem prop="name">
        <FdpgLabel html-for="dataDelivery.name" />
        <FdpgInput v-model="dataDeliveryRef.name" :placeholder="t('dataDelivery.namePlaceholder')" />
      </FdpgFormItem>

      <FdpgFormItem prop="date">
        <FdpgLabel html-for="dataDelivery.date" />
        <FdpgDatePicker v-model="dataDeliveryRef.deliveryDate" />
      </FdpgFormItem>

      <FdpgFormItem prop="locations">
        <FdpgLabel html-for="dataDelivery.locations" />
        <LocationSelect
          style="width: 580px"
          v-model="locationSelectionRef"
          :placeholder="'selectLocation'"
          :minimum-selection="[]"
          :all-locations="selectableLocations"
        />
      </FdpgFormItem>

      <div class="dms__actions">
        <el-button link @click="() => setDialogOpen(false)">{{ t('dataDelivery.cancel') }}</el-button>
        <el-button native-type="submit" :disabled="isSubmitButtonDisabled" type="primary" class="dms__button">
          {{ t('dataDelivery.initiateDeliveryAction') }}
        </el-button>
      </div>
    </form>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, ref, type PropType } from 'vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useVModel } from '@vueuse/core'
import type { ILocation } from '@/types/location.types'
import { DeliveryInfoStatus, SubDeliveryStatus, type IDeliveryInfo, type ISubDelivery } from '@/types/proposal.types'
import LocationSelect from '../LocationSelect.vue'
import FdpgInput from '../FdpgInput.vue'
import FdpgDatePicker from '../FdpgDatePicker.vue'
import FdpgFormItem from '../FdpgFormItem.vue'
import FdpgLabel from '../FdpgLabel.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  selectableLocations: {
    type: Array as PropType<ILocation[]>,
    required: true,
  },
})

const emit = defineEmits(['dialogOpenState', 'submit'])
const dialogVisible = useVModel(props, 'modelValue', emit)

const { t } = useI18n()

const dataDeliveryRef = ref<Pick<IDeliveryInfo, 'name' | 'deliveryDate'>>({ name: '', deliveryDate: new Date() })

const locationSelectionRef = ref<string[]>([])

const isSubmitButtonDisabled = computed<boolean>(
  () => locationSelectionRef.value.length === 0 || !dataDeliveryRef.value.name || !dataDeliveryRef.value.deliveryDate,
)
const handleSubmit = () => {
  const subDeliveries: ISubDelivery[] = (locationSelectionRef.value || []).map((locId) => ({
    location: locId,
    status: SubDeliveryStatus.PENDING,
  }))

  const newDelivery: IDeliveryInfo = {
    name: dataDeliveryRef.value.name,
    deliveryDate: dataDeliveryRef.value.deliveryDate,
    status: DeliveryInfoStatus.PENDING,
    subDeliveries,
  }

  emit('submit', newDelivery)

  setDialogOpen(false)
  clearValues()
}

const clearValues = () => {
  dataDeliveryRef.value = {
    name: '',
    deliveryDate: new Date(),
  }

  locationSelectionRef.value = []
}

const setDialogOpen = (openState: boolean) => {
  emit('dialogOpenState', openState)
}
</script>

<style scoped lang="scss">
@use '@/assets/sass/variable' as *;

.dms__form {
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: -1.5rem; // circumvent the FdpgDialog footer slot design
}

.dms__title {
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0 0 1rem 0;
}

.dms__help {
  color: $black;
  margin: 0;
  line-height: 125%;

  p {
    margin: 0;
  }
}

.dms__current-site {
  font-weight: 600;
}

.dms__actions {
  display: flex;
  justify-content: flex-end;
}
</style>
