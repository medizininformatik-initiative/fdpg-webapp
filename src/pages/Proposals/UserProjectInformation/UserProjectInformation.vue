<template>
  <div class="form-group-wrapper">
    <GeneralProjectInformation
      v-model="userProjectForm.generalProjectInformation"
      :review-mode="reviewMode"
      :form-ref="formRef"
    />
    <ProjectFeasibility v-model="userProjectForm.feasibility" :review-mode="reviewMode" :form-ref="formRef" />
    <ProjectResources v-model="userProjectForm.resourceAndRecontact" :review-mode="reviewMode" />
    <PropertyRights v-model="userProjectForm.propertyRights" :review-mode="reviewMode" />
    <PlannedPublications v-model="userProjectForm.plannedPublication" :review-mode="reviewMode" :form-ref="formRef" />
  </div>
</template>

<script setup lang="ts">
import type { IAttachmentsInterface } from '@/types/component.interface'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IUserProject } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
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
    type: String as PropType<PlatformIdentifier>,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const userProjectForm = useVModel(props, 'modelValue', emit)
</script>
