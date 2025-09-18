<template>
  <FdpgLabel
    required
    info="proposal.informationOnTheRequestedDataInfo"
    size="medium"
    html-for="proposal.informationOnTheRequestedData"
  />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.diagnoses">
          <FdpgLabel html-for="proposal.diagnoses" />
          <el-input-tag
            v-model="generalProjectInformationForm.diagnoses"
            data-testId="generalProjectInformationForm.diagnoses"
            :placeholder="t('proposal.diagnosesPlaceholder')"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            style="width: 100%"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="userProject.generalProjectInformation.procedures">
          <FdpgLabel html-for="proposal.procedures" />
          <el-input-tag
            v-model="generalProjectInformationForm.procedures"
            data-testId="generalProjectInformationForm.procedures"
            :placeholder="t('proposal.proceduresPlaceholder')"
            :disabled="reviewMode || generalProjectInformationForm.isDone"
            style="width: 100%"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
  <TaskViewer :object-id="generalProjectInformationForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IGeneralProjectInformation } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
