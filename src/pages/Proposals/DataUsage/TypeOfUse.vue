<template>
  <MIITypeOfUse
    :reviewMode="reviewMode"
    :platform="platform"
    :formRef="formRef"
    v-model="typeOfUseForm"
    v-if="isMiiSelected"
  />
  <DIFETypeOfUse
    :reviewMode="reviewMode"
    :platform="platform"
    :formRef="formRef"
    v-model="typeOfUseForm"
    v-if="isDifeSelected"
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
    type: String as PropType<PlatformIdentifier>,
    required: true,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
  selectedDataSources: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const typeOfUseForm = useVModel(props, 'modelValue', emit)

const isMiiSelected = computed(() => props.selectedDataSources.includes(PlatformIdentifier.Mii))
const isDifeSelected = computed(() => props.selectedDataSources.includes(PlatformIdentifier.DIFE))
</script>
