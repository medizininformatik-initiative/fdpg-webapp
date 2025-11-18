<template>
  <FdpgLabel
    v-if="informationOnRequestedBioSamplesForm"
    required
    html-for="proposal.selectedBioSamples"
    size="medium"
    :section-id="informationOnRequestedBioSamplesForm!._id"
  />
  <el-card class="form-group" v-if="!isRegisteringForm">
    <FdpgFormItem
      v-if="informationOnRequestedBioSamplesForm"
      :prop="'userProject.informationOnRequestedBioSamples.noSampleRequired'"
    >
      <el-checkbox
        v-model="informationOnRequestedBioSamplesForm.noSampleRequired"
        :data-testId="'userProject.informationOnRequestedBioSamples.noSampleRequired'"
        :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
        :label="t('proposal.noSampleRequired')"
        class="fdpg-checkbox"
        :size="FdpgInputSize.Small"
      />
    </FdpgFormItem>
    <FdpgFormItem
      v-if="informationOnRequestedBioSamplesForm"
      :prop="'userProject.informationOnRequestedBioSamples.laboratoryResources'"
    >
      <FdpgLabel html-for="proposal.biosampleLaboratoryResources" required />
      <FdpgTextEditor
        v-model="informationOnRequestedBioSamplesForm.laboratoryResources"
        :data-testId="'userProject.informationOnRequestedBioSamples.laboratoryResources'"
        :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
        :placeholder="t('proposal.biosampleLaboratoryResourcesPlaceholder')"
        size="medium"
        :formRef="formRef"
        :field-path="'userProject.informationOnRequestedBioSamples.laboratoryResources'"
      />
    </FdpgFormItem>
  </el-card>
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
              <FdpgLabel html-for="proposal.biosampleType" required />
              <el-radio-group
                v-model="biosample.type"
                :data-testId="'biosample.type__radio__' + index"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                size="small"
                class="biosample-radio-group"
              >
                <FdpgRadio
                  v-for="(option, optionIndex) in biosamlpeTypeOptions"
                  :key="optionIndex"
                  :label="option.label"
                  :value="option.value"
                  :name="`biosample.type__radio__${index}`"
                  :data-testId="'biosample.type__radio__' + index + '__' + optionIndex"
                  :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                  :size="FdpgInputSize.Small"
                >
                  {{ option.label }}
                </FdpgRadio>
              </el-radio-group>
            </FdpgFormItem>

            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].typeDetails`"
              :rules="isRegisteringForm ? [] : biosampleRules.typeDetails"
            >
              <FdpgLabel html-for="proposal.biosampleTypeDetails" />
              <FdpgInput
                v-model="biosample.typeDetails"
                :data-testId="'biosample.typeDetails__' + index"
                placeholder="proposal.biosampleTypePlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
          </el-col>

          <el-col :sm="24" v-if="!isRegisteringForm">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].requirements`"
              :rules="biosampleRules.requirements"
            >
              <FdpgLabel html-for="proposal.biosampleMaterialRequirements" required />
              <FdpgInput
                v-model="biosample.requirements"
                :data-testId="'biosample.requirements__' + index"
                placeholder="proposal.biosampleMaterialRequirementsPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].count`"
              :rules="biosampleRules.count"
            >
              <FdpgLabel html-for="proposal.biosampleCount" required />
              <FdpgInput
                v-model="biosample.count"
                :data-testId="'biosample.count__' + index"
                placeholder="proposal.biosampleCountPlaceholder"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              />
            </FdpgFormItem>

            <FdpgFormItem :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].optionalBiosample`">
              <el-checkbox
                v-model="biosample.optionalBiosample"
                :data-testId="'biosample.optionalBiosample__' + index"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                :label="t('proposal.optionalBiosample')"
                :size="FdpgInputSize.Small"
                class="fdpg-checkbox"
              />
            </FdpgFormItem>
          </el-col>

          <el-col :sm="24">
            <FdpgFormItem :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].sampleCode`">
              <FdpgLabel html-for="proposal.sampleCode" />
              <el-checkbox-group
                v-model="biosample.sampleCode"
                style="width: 100%"
                :data-testId="'biosample.sampleCode__checkbox__' + index"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
              >
                <el-row :gutter="16">
                  <el-col :sm="12" v-for="(option, optionIndex) in sampleCodeOptions">
                    <Fdpgcheckbox
                      :key="optionIndex"
                      :label="option.label"
                      :value="option.value"
                      :size="FdpgInputSize.Small"
                      :name="`biosample.sampleCode__checkbox__${index}`"
                      :data-testId="'biosample.sampleCode__checkbox__' + index + '__' + optionIndex"
                      :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                    >
                    </Fdpgcheckbox>
                    <FdpgFormItem
                      :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}][${option.value}]`"
                    >
                      <FdpgInput
                        v-model="biosample[option.value]"
                        :data-testId="'biosample.sampleCodeTexts__' + index + '__' + option.value"
                        :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                        placeholder="proposal.biosampleCodeTextPlaceholder"
                      />
                    </FdpgFormItem>
                  </el-col>
                </el-row>
              </el-checkbox-group>
            </FdpgFormItem>
          </el-col>

          <el-col :sm="24" v-if="!isRegisteringForm">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].method`"
              :rules="biosampleRules.method"
            >
              <FdpgLabel html-for="proposal.biosampleMethod" required />
              <FdpgTextEditor
                v-model="biosample.method"
                :data-testId="'biosample.method__' + index"
                :placeholder="t('proposal.biosampleMethodPlaceholder')"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                :formRef="formRef"
                :field-path="`userProject.informationOnRequestedBioSamples.biosamples[${index}].method`"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="24" v-if="!isRegisteringForm">
            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].externalLabTransfer`"
            >
              <el-checkbox
                v-model="biosample.externalLabTransfer"
                :data-testId="'biosample.externalLabTransfer__' + index"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                :label="t('proposal.externalLabTransfer')"
                :size="FdpgInputSize.Small"
                class="fdpg-checkbox"
              />
            </FdpgFormItem>

            <FdpgFormItem
              :prop="`userProject.informationOnRequestedBioSamples.biosamples[${index}].externalLabTransferDetails`"
              :rules="biosampleRules.externalLabTransferDetails"
            >
              <FdpgTextEditor
                v-model="biosample.externalLabTransferDetails"
                :data-testId="'biosample.externalLabTransferDetails__' + index"
                :disabled="reviewMode || informationOnRequestedBioSamplesForm.isDone"
                :placeholder="t('proposal.externalLabTransferDetailsPlaceholder')"
                :formRef="formRef"
                :field-path="`userProject.informationOnRequestedBioSamples.biosamples[${index}].externalLabTransferDetails`"
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
    link
    class="add-more-button add-more-button--biosample"
    data-testId="handleAddAnotherBiosample"
    @click="handleAddAnotherBiosample"
  >
    <i class="el-icon-plus" aria-hidden="true" />
    <span class="add-text">{{ t('proposal.addMoreBioSamples') }}</span>
  </el-button>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IBiosample, IInformationOnRequestedBioSamples } from '@/types/proposal.types'
import { BiosampleType, BiosampleCode } from '@/types/proposal.types'
import { mapBiosample } from '@/utils/form-transform/transform-user-project.util'
import { maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { ref } from 'vue'
import InformationOnBioSampleCollapsed from './InformationOnBioSampleCollapsed.vue'
import Fdpgcheckbox from '@/components/FdpgCheckbox.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FdpgInputSize } from '@/types/component.types'
import type { TranslationSchema } from '@/plugins/i18n'

const { t } = useI18n()

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

  isRegisteringForm: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const informationOnRequestedBioSamplesForm = useVModel(props, 'modelValue', emit)

if (informationOnRequestedBioSamplesForm.value === undefined) {
  informationOnRequestedBioSamplesForm.value = {
    noSampleRequired: false,
    laboratoryResources: '',
    biosamples: [],
  }
}

if (
  informationOnRequestedBioSamplesForm.value?.biosamples &&
  Array.isArray(informationOnRequestedBioSamplesForm.value.biosamples) &&
  informationOnRequestedBioSamplesForm.value.biosamples.length === 0
) {
  informationOnRequestedBioSamplesForm.value.biosamples.push(mapBiosample() as IBiosample)
}

const biosampleRules = {
  type: [requiredValidationFunc('string')],
  sampleCode: [requiredValidationFunc('array')],
  typeDetails: [requiredValidationFunc('string'), maxLengthValidationFunc(1000)],
  count: [requiredValidationFunc('string'), maxLengthValidationFunc(1000)],
  requirements: [requiredValidationFunc('string'), maxLengthValidationFunc(1000)],
  method: [requiredValidationFunc('string'), maxLengthValidationFunc(3000)],
  externalLabTransferDetails: [maxLengthValidationFunc(1000)],
}

const biosampleSectionActiveKey = ref(0)

const biosamlpeTypeOptions = computed(() =>
  Object.keys(BiosampleType).map((key) => ({
    label: `proposal.biosampleType_${key}` as TranslationSchema,
    value: BiosampleType[key as keyof typeof BiosampleType],
  })),
)

const sampleCodeOptions = computed(() =>
  Object.keys(BiosampleCode).map((key) => ({
    label: `proposal.${key}`,
    value: BiosampleCode[key as keyof typeof BiosampleCode],
  })),
)

const handleEdit = (value: number) => {
  biosampleSectionActiveKey.value = value
}

const handleAddAnotherBiosample = async () => {
  informationOnRequestedBioSamplesForm.value?.biosamples.push(mapBiosample() as IBiosample)
  biosampleSectionActiveKey.value = informationOnRequestedBioSamplesForm.value
    ? informationOnRequestedBioSamplesForm.value.biosamples.length - 1
    : 0
}

const handleRemove = async (id: number) => {
  informationOnRequestedBioSamplesForm.value?.biosamples.splice(id, 1)

  if (id <= biosampleSectionActiveKey.value) {
    biosampleSectionActiveKey.value = Math.max(biosampleSectionActiveKey.value - 1, 0)
  }
}
</script>
<style lang="scss" scoped>
.biosample-radio-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
