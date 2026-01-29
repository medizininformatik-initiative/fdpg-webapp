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
        <FdpgFormItem prop="registerInfo.diagnoses">
          <FdpgLabel required html-for="proposal.diagnoses" />
          <el-input-tag
            v-model="registerInfoForm.diagnoses"
            data-testId="registerInfoForm.diagnoses"
            :placeholder="t('proposal.diagnosesPlaceholder')"
            :disabled="reviewMode"
            style="width: 100%"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem prop="registerInfo.procedures">
          <FdpgLabel required html-for="proposal.procedures" />
          <el-input-tag
            v-model="registerInfoForm.procedures"
            data-testId="registerInfoForm.procedures"
            :placeholder="t('proposal.proceduresPlaceholder')"
            :disabled="reviewMode"
            style="width: 100%"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
  <TaskViewer :object-id="registerInfoForm?._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IRegisterInfo } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  modelValue: {
    type: Object as PropType<IRegisterInfo>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const registerInfoForm = useVModel(props, 'modelValue', emit)
</script>
