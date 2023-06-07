<template>
  <FdpgLabel html-for="proposal.propertyRights" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem>
      <FdpgLabel
        html-for="proposal.intellectualPropertyRightCreationApplicationOptions"
        info="proposal.intellectualPropertyRightCreationApplicationOptionsInfo"
      />
      <FdpgInput
        v-model="propertyRightsForm.options"
        data-testId="propertyRightsForm.options"
        placeholder="proposal.pleaseNameYourIntellectualPropertyRights"
        :disabled="reviewMode || propertyRightsForm.isDone"
      />
    </FdpgFormItem>
  </el-card>

  <TaskViewer :object-id="propertyRightsForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IPropertyRights } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IPropertyRights>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const propertyRightsForm = useVModel(props, 'modelValue', emit)
</script>
