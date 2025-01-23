<template>
  <FdpgLabel
    :required="required"
    size="medium"
    class="form-label-mb-9"
    html-for="proposal.involvedCategory"
    info="proposal.involvedCategoryInfo"
  />
  <el-card class="form-group">
    <FdpgFormItem :prop="`${identifier}.participantCategory.category`" :rules="formRules.category">
      <el-radio-group
        v-model="participantCategory.category"
        :data-testId="`${identifier}.participantCategory.category`"
        class="el-radio-group-mt-12"
        :disabled="reviewMode || participantCategory.isDone"
      >
        <FdpgRadio
          :test-id-extension="'__' + identifier"
          value="DATA_AND_BIOSAMPLE_RECEIVER"
          label="proposal.participantCategory_DATA_AND_BIOSAMPLE_RECEIVER"
        />
      </el-radio-group>
    </FdpgFormItem>
  </el-card>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import { ParticipantType, type IParticipantCategory } from '@/types/proposal.types'
import { requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { onMounted, type PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IParticipantCategory>,
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

  identifier: {
    type: String,
    required: true,
  },

  required: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const participantCategory = useVModel(props, 'modelValue', emit)

const formRules = {
  category: requiredValidationFunc(undefined, props.required),
}

onMounted(() => {
  if (props.modelValue.category === undefined) {
    participantCategory.value.category = ParticipantType.DataAndBiosampleReceiver
  }
})
</script>
