<template>
  <FdpgLabel
    required
    info="proposal.informationOnTheRequestedDataInfo"
    size="medium"
    html-for="proposal.informationOnTheRequestedData"
  />
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="requestedData.dataInfo">
          <FdpgLabel html-for="proposal.informationOnDataSelection" />
          <FdpgTextEditor
            v-model="requestedDataForm.dataInfo"
            data-testId="requestedData.dataInfo"
            :disabled="reviewMode || requestedDataForm.isDone"
            :placeholder="t('proposal.pleaseEnterYourDataSelectionInformationHere')"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
  <TaskViewer :object-id="requestedDataForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IRequestedData } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()
</script>
