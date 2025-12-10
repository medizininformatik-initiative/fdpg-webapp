<template>
  <FdpgDialog :title="t('dataDelivery.extendDelivery')" :model-value="props.modelValue">
    <FdpgLabel html-for="dataDelivery.date" />
    <FdpgDatePicker v-model="newDeliveryDate" :min-date="minDate" />

    <template #footer>
      <el-button plain @click="onClose">
        {{ t('general.cancel') }}
      </el-button>

      <el-button type="primary" :disabled="isSubmitButtonDisabled" @click="onSubmit">
        {{ t('dataDelivery.extendDelivery') }}
      </el-button>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import FdpgDialog from '../FdpgDialog.vue'
import { computed, onMounted, ref, type PropType, type Ref } from 'vue'
import type { IDeliveryInfo } from '@/types/proposal.types'
import FdpgLabel from '../FdpgLabel.vue'
import FdpgDatePicker from '../FdpgDatePicker.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  deliveryInfo: {
    type: Object as PropType<IDeliveryInfo>,
    required: true,
  },
})

const emit = defineEmits(['submit', 'closeDialog'])

const { t } = useI18n()

const newDeliveryDate: Ref<Date | undefined> = ref(undefined)
const isSubmitButtonDisabled = computed(() => !newDeliveryDate.value)
const minDate = computed(() => new Date(props.deliveryInfo.deliveryDate))

const onSubmit = () => {
  if (!newDeliveryDate.value) {
    throw new Error('No date set')
  }
  emit('submit', props.deliveryInfo._id, newDeliveryDate.value)
}

const onClose = () => emit('closeDialog')

onMounted(() => {
  newDeliveryDate.value = new Date(props.deliveryInfo.deliveryDate)
})
</script>

<style lang="css"></style>
