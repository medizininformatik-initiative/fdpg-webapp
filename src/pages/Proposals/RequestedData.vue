<template>
  <div class="form-group-wrapper">
    <el-card class="form-group">
      <el-row>
        <el-col :sm="24">
          <FdpgFormItem prop="requestedData.patientInfo">
            <FdpgLabel html-for="proposal.patientInfo" />
            <FdpgInput
              v-model="requestedDataForm.patientInfo"
              data-testId="requestedData.patientInfo"
              placeholder="proposal.pleaseEnterYourDetailsForPatientSelectionHere"
              :disabled="reviewMode || requestedDataForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem prop="requestedData.dataInfo">
            <FdpgLabel html-for="proposal.informationOnDataSelection" />
            <FdpgInput
              v-model="requestedDataForm.dataInfo"
              data-testId="requestedData.dataInfo"
              placeholder="proposal.pleaseEnterYourDataSelectionInformationHere"
              :disabled="reviewMode || requestedDataForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
        <el-col :sm="24">
          <FdpgFormItem prop="requestedData.desiredDataAmount">
            <FdpgLabel html-for="proposal.informationOnDesiredDataAmount" />
            <FdpgNumberInput
              v-model="requestedDataForm.desiredDataAmount"
              data-testId="requestedData.desiredDataAmount"
              placeholder="proposal.desiredDataAmountPlaceholder"
              :disabled="reviewMode || requestedDataForm.isDone"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-card>

    <TaskViewer :object-id="requestedDataForm._id" />
  </div>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgNumberInput from '@/components/FdpgNumberInput.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IRequestedData } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IRequestedData>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const requestedDataForm = useVModel(props, 'modelValue', emit)
</script>
