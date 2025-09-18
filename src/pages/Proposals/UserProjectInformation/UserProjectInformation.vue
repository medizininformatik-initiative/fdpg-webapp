<template>
  <div class="form-group-wrapper">
    <GeneralProjectInformation
      v-model="userProjectForm.generalProjectInformation"
      :review-mode="reviewMode"
      :form-ref="formRef"
      :is-registering-form="isRegisteringForm"
    />
    <ProjectResources
      v-model="userProjectForm.resourceAndRecontact"
      :review-mode="reviewMode"
      v-if="isMIISelected && !isRegisteringForm"
    />
    <PropertyRights v-model="userProjectForm.propertyRights" :review-mode="reviewMode" v-if="isMIISelected" />
    <PlannedPublications
      v-model="userProjectForm.plannedPublication"
      :review-mode="reviewMode"
      :form-ref="formRef"
      v-if="isMIISelected && !isRegisteringForm"
    />
  </div>
</template>

<script setup lang="ts">
import type { IAttachmentsInterface } from '@/types/component.interface'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IUserProject } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { computed, type PropType } from 'vue'
import PlannedPublications from '../PlannedPublications/PlannedPublications.vue'
import GeneralProjectInformation from './GeneralProjectInformation.vue'
import ProjectResources from './ProjectResources.vue'
import PropertyRights from './PropertyRights.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IUserProject>,
    required: true,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  fileList: {
    type: Array as PropType<IAttachmentsInterface[]>,
    default: () => {
      return []
    },
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  platform: {
    type: Array as PropType<PlatformIdentifier[]>,
    required: true,
  },
  isRegisteringForm: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const userProjectForm = useVModel(props, 'modelValue', emit)

const isMIISelected = computed(() => {
  return props.platform.includes(PlatformIdentifier.Mii)
})
</script>
