<template>
  <FdpgLabel html-for="proposal.propertyRights" size="medium" />
  <el-card class="form-group">
    <FdpgFormItem>
      <FdpgLabel
        html-for="proposal.intellectualPropertyRightCreationApplicationOptions"
        info="proposal.intellectualPropertyRightCreationApplicationOptionsInfo"
      />
      <FdpgTextEditor
        v-model="propertyRightsForm.options"
        data-testId="propertyRightsForm.options"
        :placeholder="t('proposal.pleaseNameYourIntellectualPropertyRights')"
        :disabled="reviewMode || propertyRightsForm.isDone"
        :maxLength="10_000"
      />
    </FdpgFormItem>
  </el-card>

  <TaskViewer :object-id="propertyRightsForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IPropertyRights } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
