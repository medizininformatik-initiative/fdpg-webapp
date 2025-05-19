<template>
  <div class="form-group-wrapper">
    <GeneralProjectInformation
      v-model="userProjectForm.generalProjectInformation"
      :review-mode="reviewMode"
      :form-ref="formRef"
    />
    <ProjectFeasibility
      v-model="userProjectForm.feasibility"
      :review-mode="reviewMode"
      :form-ref="formRef"
      v-if="isMIISelected"
    />
    <ProjectResources v-model="userProjectForm.resourceAndRecontact" :review-mode="reviewMode" v-if="isMIISelected" />
    <PropertyRights v-model="userProjectForm.propertyRights" :review-mode="reviewMode" v-if="isMIISelected" />
    <PlannedPublications
      v-model="userProjectForm.plannedPublication"
      :review-mode="reviewMode"
      :form-ref="formRef"
      v-if="isMIISelected"
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
import ProjectFeasibility from './ProjectFeasibility.vue'
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
})

const emit = defineEmits(['update:modelValue'])

const userProjectForm = useVModel(props, 'modelValue', emit)

const isMIISelected = computed(() => {
  return props.platform.includes(PlatformIdentifier.Mii)
})
</script>
