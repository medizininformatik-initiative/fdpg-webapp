<template>
  <el-form ref="formRef" class="additional-info-form" :model="form">
    <FdpgFormItem prop="legalBasis">
      <div class="fdpg-checkbox-wrapper">
        {{ $t('proposal.updateAdditionalLocationLegalBasis') }}
        <el-checkbox v-model="form.legalBasis" class="fdpg-checkbox" :disabled="isDisabled" />
      </div>
    </FdpgFormItem>
    <FdpgFormItem prop="locationPublicationName">
      <div class="additional-info-form-item-publication-name">
        {{ $t('proposal.updateAdditionalLocationPublicationName') }}
        <FdpgInput
          v-model="form.locationPublicationName"
          placeholder="proposal.updateAdditionalLocationPublicationNamePlaceholder"
          type="textarea"
          :rows="2"
          autosize
          :disabled="isDisabled"
        />
      </div>
    </FdpgFormItem>

    <el-button v-if="!isDisabled" :disabled="!formChanged" class="el-button el-button--primary" @click="onSubmit()">{{
      $t('general.save')
    }}</el-button>
  </el-form>
</template>

<script setup lang="ts">
import type { IEditAdditionalLocationProposalInformation } from '@/types/proposal.types'
import { reactive, ref, watch, type PropType } from 'vue'
import FdpgInput from './FdpgInput.vue'

const props = defineProps({
  additionalInformation: {
    type: Object as PropType<IEditAdditionalLocationProposalInformation>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['submit'])

const formChanged = ref<boolean>(false)

watch(props, (newVal) => {
  form.legalBasis = newVal.additionalInformation.legalBasis
  form.locationPublicationName = newVal.additionalInformation.locationPublicationName
})

const form = reactive({
  legalBasis: props.additionalInformation.legalBasis,
  locationPublicationName: props.additionalInformation.locationPublicationName,
})

watch(
  form,
  ({ legalBasis, locationPublicationName }) => {
    formChanged.value =
      legalBasis !== props.additionalInformation.legalBasis ||
      locationPublicationName !== props.additionalInformation.locationPublicationName
  },
  { deep: true },
)

const onSubmit = () => {
  emit('submit', { legalBasis: form.legalBasis, locationPublicationName: form.locationPublicationName })
  props.additionalInformation.legalBasis = form.legalBasis
  props.additionalInformation.locationPublicationName = form.locationPublicationName
  formChanged.value = false
}
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.additional-info-form {
  padding-top: 2em;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1em;
  width: 100%;
  font-weight: bold;
  font-size: medium;

  .fdpg-form-item {
    width: 100%;
  }

  .additional-info-form-item-legal {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1em;
  }

  .fdpg-checkbox-wrapper {
    font-size: medium;
    .fdpg-checkbox {
      margin-left: 10px;
      padding: 0.5em;
      height: 100%;

      &.is-checked {
        .el-checkbox__label {
          color: $white;
        }
      }
    }
  }

  .additional-info-form-item-publication-name {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100%;
    font-size: medium;

    .fdpg-input {
      max-width: 40em;
      min-width: 20em;
    }
  }
}
</style>
