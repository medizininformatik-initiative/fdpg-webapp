<template>
  <FdpgLabel
    v-if="informationOnRequestedBioSamplesForm"
    required
    html-for="proposal.informationOnRequestedBioSamples"
    size="medium"
    :section-id="informationOnRequestedBioSamplesForm!._id"
  />
  <template v-if="informationOnRequestedBioSamplesForm && informationOnRequestedBioSamplesForm.biosamples">
    <template v-for="(biosample, index) in informationOnRequestedBioSamplesForm.biosamples" :key="index">
      <InformationOnBioSampleCollapsed
        v-if="biosampleSectionActiveKey !== index"
        :data-testId="'userProject.informationOnRequestedBioSamples.biosamples__collapsed__' + index"
        :biosample-form="biosample"
        :form-ref="formRef"
        :index="index"
        :review-mode="reviewMode"
        @edit="handleEdit"
        @remove="handleRemove"
      ></InformationOnBioSampleCollapsed>

      <el-card
        v-show="biosampleSectionActiveKey === index"
        class="form-group"
        data-testId="userProject.informationOnRequestedBioSamples.biosamples"
      >
        <el-row :gutter="20">
          <el-col :sm="24">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].type`"
              :rules="biosampleRules.type"
            >
              <FdpgLabel html-for="proposal.biosampleType" />
              <FdpgInput
                v-model="biosample.type"
                :data-testId="'biosample.type__' + index"
                placeholder="proposal.biosampleTypePlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="12">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].count`"
              :rules="biosampleRules.count"
            >
              <FdpgLabel html-for="proposal.biosampleCount" />
              <FdpgInput
                v-model="biosample.count"
                :data-testId="'biosample.count__' + index"
                placeholder="proposal.biosampleCountPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="12">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].parameter`"
              :rules="biosampleRules.parameter"
            >
              <FdpgLabel html-for="proposal.biosampleParameter" />
              <FdpgInput
                v-model="biosample.parameter"
                :data-testId="'biosample.parameter__' + index"
                placeholder="proposal.biosampleParameterPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="12">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].laboratoryResources`"
              :rules="biosampleRules.laboratoryResources"
            >
              <FdpgLabel html-for="proposal.biosampleLaboratoryResources" />
              <FdpgInput
                v-model="biosample.laboratoryResources"
                :data-testId="'biosample.laboratoryResources__' + index"
                placeholder="proposal.biosampleLaboratoryResourcesPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="24">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].requirements`"
              :rules="biosampleRules.requirements"
            >
              <FdpgLabel html-for="proposal.biosampleMaterialRequirements" />
              <FdpgInput
                v-model="biosample.requirements"
                :data-testId="'biosample.requirements__' + index"
                placeholder="proposal.biosampleMaterialRequirementsPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>
      </el-card>

      <TaskViewer :object-id="informationOnRequestedBioSamplesForm._id" />
    </template>
  </template>
  <el-button
    v-if="!reviewMode && !informationOnRequestedBioSamplesForm?.isDone"
    type="text"
    class="add-more-button add-more-button--biosample"
    data-testId="handleAddAnotherBiosample"
    @click="handleAddAnotherBiosample"
  >
    <i class="el-icon-plus" aria-hidden="true" />
    <span class="add-text">{{ $t('proposal.addMoreBioSamples') }}</span>
  </el-button>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IBiosample, IInformationOnRequestedBioSamples } from '@/types/proposal.types'
import { mapBiosample } from '@/utils/form-transform/transform-user-project.util'
import { maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
import InformationOnBioSampleCollapsed from './InformationOnBioSampleCollapsed.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IInformationOnRequestedBioSamples | undefined>,
    required: false,
    default: () => undefined,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const informationOnRequestedBioSamplesForm = useVModel(props, 'modelValue', emit)

if (informationOnRequestedBioSamplesForm.value === undefined) {
  informationOnRequestedBioSamplesForm.value = {
    biosamples: [],
  }
}
if (
  !informationOnRequestedBioSamplesForm.value?.biosamples ||
  !informationOnRequestedBioSamplesForm.value?.biosamples.length
) {
  informationOnRequestedBioSamplesForm.value = {
    biosamples: [mapBiosample() as IBiosample],
  }
}

const biosampleRules = {
  type: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  count: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  parameter: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  laboratoryResources: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
  requirements: [requiredValidationFunc('string'), maxLengthValidationFunc(10000)],
}

const biosampleSectionActiveKey = ref(0)

const handleEdit = (value: number) => {
  biosampleSectionActiveKey.value = value
}

const handleAddAnotherBiosample = async () => {
  informationOnRequestedBioSamplesForm.value?.biosamples.push(mapBiosample() as IBiosample)
  biosampleSectionActiveKey.value = informationOnRequestedBioSamplesForm.value!.biosamples.length - 1
}

const handleRemove = async (id: number) => {
  informationOnRequestedBioSamplesForm.value?.biosamples.splice(id, 1)

  if (id <= biosampleSectionActiveKey.value) {
    biosampleSectionActiveKey.value = Math.max(biosampleSectionActiveKey.value - 1, 0)
  }
}

onBeforeUnmount(() => {
  informationOnRequestedBioSamplesForm.value = undefined
})
</script>
