<template>
  <div class="form-group-wrapper">
    <GeneralProjectInformation v-model="userProjectForm.generalProjectInformation" :review-mode="reviewMode" />
    <ProjectFeasibility v-model="userProjectForm.feasibility" :review-mode="reviewMode" />
    <ProjectDetails v-model="userProjectForm.projectDetails" :review-mode="reviewMode" />
    <EthicVote v-model="userProjectForm.ethicVote" :review-mode="reviewMode" />
    <ProjectResources v-model="userProjectForm.resourceAndRecontact" :review-mode="reviewMode" />
    <PropertyRights v-model="userProjectForm.propertyRights" :review-mode="reviewMode" />
    <PlannedPublications v-model="userProjectForm.plannedPublication" :review-mode="reviewMode" :form-ref="formRef" />
    <ProjectAddresses v-model="userProjectForm.addressees" :review-mode="reviewMode" />
    <TypeOfUse v-model="userProjectForm.typeOfUse" :review-mode="reviewMode" :platform="platform" />
    <InformationOnBioSample
      v-if="hasBiosamples"
      v-model="userProjectForm.informationOnRequestedBioSamples"
      :review-mode="reviewMode"
      :form-ref="formRef"
    />
  </div>
</template>

<script setup lang="ts">
import type { IAttachmentsInterface } from '@/types/component.interface'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IUserProject } from '@/types/proposal.types'
import { ProposalTypeOfUse } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { computed } from 'vue'
import InformationOnBioSample from '../InformationOnBioSample/InformationOnBioSample.vue'
import PlannedPublications from '../PlannedPublications/PlannedPublications.vue'
import EthicVote from './EthicVote.vue'
import GeneralProjectInformation from './GeneralProjectInformation.vue'
import ProjectAddresses from './ProjectAddresses.vue'
import ProjectDetails from './ProjectDetails.vue'
import ProjectFeasibility from './ProjectFeasibility.vue'
import ProjectResources from './ProjectResources.vue'
import PropertyRights from './PropertyRights.vue'
import TypeOfUse from './TypeOfUse.vue'

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

const hasBiosamples = computed(() => {
  return userProjectForm.value.typeOfUse.usage?.includes(ProposalTypeOfUse.Biosample)
})
</script>
