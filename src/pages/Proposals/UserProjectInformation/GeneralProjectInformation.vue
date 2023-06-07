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
          <FdpgInput
            v-model="generalProjectInformationForm.projectFunding"
            data-testId="generalProjectInformation.projectFunding"
            placeholder="proposal.pleaseEnterTheProjectFunding"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            type="textarea"
            :rows="2"
            autosize
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
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgNumberInput from '@/components/FdpgNumberInput.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IGeneralProjectInformation } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IGeneralProjectInformation>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['update:modelValue'])

const generalProjectInformationForm = useVModel(props, 'modelValue', emit)
</script>
