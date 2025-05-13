<template>
  <FdpgLabel size="medium" class="form-label-mt-4" html-for="proposal.generalProjectInformation" />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectTitle">
          <FdpgLabel required html-for="proposal.projectTitle" info="proposal.projectTitleInfo" />
          <FdpgInput
            v-model="generalProjectInformationForm.projectTitle"
            data-testId="generalProjectInformationForm.projectTitle"
            placeholder="proposal.pleaseEnterTheProjectTitle"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          prop="userProject.generalProjectInformation.desiredStartTimeType"
          data-testId="generalProjectInformationForm.desiredStartTimeType"
        >
          <FdpgLabel html-for="proposal.desiredStartTime" />
          <el-radio-group
            v-model="generalProjectInformationForm.desiredStartTimeType"
            data-testId="generalProjectInformationForm.desiredStartTimeType"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            @change="handleStartTimeTypeChange"
          >
            <FdpgRadio
              v-for="option in ['immediate', 'later']"
              :key="`checklist-option-${option}`"
              :value="option"
              :label="'proposal.desiredStartTime_' + option"
            />
          </el-radio-group>
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          v-if="generalProjectInformationForm.desiredStartTimeType === 'later'"
          prop="userProject.generalProjectInformation.desiredStartTime"
          data-testId="generalProjectInformationForm.desiredStartTime"
        >
          <FdpgLabel required html-for="proposal.desiredStartTime" />

          <FdpgDatePicker
            v-model="generalProjectInformationForm.desiredStartTime"
            data-testId="generalProjectInformationForm.desiredStartTime"
            placeholder="proposal.pleaseEnterTheStartTime"
            :min-date="new Date()"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.keywords">
          <FdpgLabel required html-for="proposal.keywords" />
          <el-input-tag
            v-model="generalProjectInformationForm.keywords"
            class="fdpg-input__tag"
            data-testId="generalProjectInformationForm.keywords"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            :placeholder="$t('proposal.keywordsPlaceholder')"
            aria-label="Please click the Enter key after input"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectDuration">
          <FdpgLabel required info="proposal.projectDurationInfo" html-for="proposal.projectDuration" />
          <FdpgNumberInput
            v-model="generalProjectInformationForm.projectDuration"
            data-testId="generalProjectInformationForm.projectDuration"
            placeholder="proposal.pleaseEnterTheNumberOfMonths"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.projectFunding">
          <FdpgLabel required html-for="proposal.projectFunding" />

          <FdpgTextEditor
            ref="projectFundingEditor"
            v-model="generalProjectInformationForm.projectFunding"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            data-testId="generalProjectInformation.projectFunding"
            :form-ref="formRef"
            field-path="userProject.generalProjectInformation.projectFunding"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.generalProjectInformation.fundingReferenceNumber">
          <FdpgLabel html-for="proposal.fundingReferenceNumber" />
          <FdpgInput
            v-model="generalProjectInformationForm.fundingReferenceNumber"
            data-testId="generalProjectInformationForm.fundingReferenceNumber"
            placeholder="proposal.pleaseEnterTheFundingReferenceNumber"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>

  <TaskViewer :object-id="generalProjectInformationForm._id" />
</template>

<script setup lang="ts">
import FdpgDatePicker from '@/components/FdpgDatePicker.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgNumberInput from '@/components/FdpgNumberInput.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IGeneralProjectInformation } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IGeneralProjectInformation>,
    required: true,
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

const generalProjectInformationForm = useVModel(props, 'modelValue', emit) as unknown as IGeneralProjectInformation
const projectFundingEditor = ref()

const handleStartTimeTypeChange = (newValue: string) => {
  if (newValue === 'immediate') {
    generalProjectInformationForm.desiredStartTime = ''
    setTimeout(() => {
      if (props.formRef) {
        props.formRef.validateField('userProject.generalProjectInformation.desiredStartTime')
      }
    }, 0)
  }
}
</script>
<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;
.fdpg-input__tag {
  height: 59px;
  color: $black;
  padding: 0 11px;
  font-size: 18px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: 'Titillium Web', serif;
  border: 0.5px solid $gray-700;
}
</style>
