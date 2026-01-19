<template>
  <FdpgDialog
    :model-value="props.modelValue"
    :title="t('dataDelivery.rateDeliveryDialogTitle')"
    :message="t('dataDelivery.rateDeliveryDialogMessage')"
  >
    <div>
      <el-radio-group v-model="selectionRef" class="el-radio-group-mt-12 rate-dialog__radio-button-group">
        <FdpgRadio v-for="option in radioOptions" :value="option.value"> {{ option.label }}</FdpgRadio>
      </el-radio-group>
    </div>

    <template #footer>
      <el-button plain link @click="closeDialog">{{ t('general.cancel') }}</el-button>
      <el-button type="primary" :disabled="!selectionRef" @click="onRateSubDelivery">{{
        t('dataDelivery.rateDeliverySubmit')
      }}</el-button>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { SubDeliveryStatus } from '@/types/proposal.types'
import { computed, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '../FdpgDialog.vue'
import useNotifications from '@/composables/use-notifications'
import FdpgRadio from '../FdpgRadio.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
  },
})

const emit = defineEmits(['closeDialog', 'submit'])

const { t } = useI18n()
const { showErrorMessage } = useNotifications()

const radioOptions = computed(() => [
  { label: t('dataDelivery.rateDeliveryAccept'), value: '' + SubDeliveryStatus.ACCEPTED },
  { label: t('dataDelivery.rateDeliveryRepeat'), value: '' + SubDeliveryStatus.REPEATED },
])

const selectionRef: Ref<SubDeliveryStatus | null> = ref(null)

const closeDialog = () => emit('closeDialog')

const onRateSubDelivery = () => {
  if (!selectionRef.value) {
    showErrorMessage(t('general.pleaseSelectFile'))
    return
  }

  emit('submit', selectionRef.value)
}
</script>

<style lang="css">
.rate-dialog__radio-button-group {
  padding-top: 20px;
}
</style>
