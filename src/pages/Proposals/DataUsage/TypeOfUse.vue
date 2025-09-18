<template>
  <DIFETypeOfUse
    :reviewMode="reviewMode"
    :platform="PlatformIdentifier.DIFE"
    :formRef="formRef"
    v-model="typeOfUseForm"
    v-if="isDifeSelected && !isRegisteringForm"
  />
  <MIITypeOfUse
    :reviewMode="reviewMode"
    :platform="PlatformIdentifier.Mii"
    :formRef="formRef"
    v-model="typeOfUseForm"
    v-if="isMiiSelected"
    :is-registering-form="isRegisteringForm"
  />

  <PseudonymizationInfo
    v-if="isMiiSelected && !isRegisteringForm"
    :reviewMode="reviewMode"
    :formRef="formRef"
    v-model="typeOfUseForm.pseudonymizationInfo"
    :pseudonymizationInfoTexts="typeOfUseForm.pseudonymizationInfoTexts"
  />
</template>

<script setup lang="ts">
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITypeOfUse } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { computed, type PropType } from 'vue'
import MIITypeOfUse from './MIITypeOfUse.vue'
import DIFETypeOfUse from './DIFETypeOfUse.vue'
import PseudonymizationInfo from './PseudonymizationInfo.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<ITypeOfUse>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  platform: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
  isRegisteringForm: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const typeOfUseForm = useVModel(props, 'modelValue', emit)

const isMiiSelected = computed(() => props.platform.includes(PlatformIdentifier.Mii))
const isDifeSelected = computed(() => props.platform.includes(PlatformIdentifier.DIFE))
</script>
