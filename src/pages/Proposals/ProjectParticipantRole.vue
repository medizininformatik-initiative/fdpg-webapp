<template>
  <FdpgLabel :required="required" size="medium" class="form-label-mb-9" html-for="proposal.involvedRole" />
  <el-card class="form-group">
    <FdpgFormItem :prop="`${identifier}.participantRole.role`" :rules="formRules.role">
      <el-radio-group
        v-model="participantRole.role"
        :data-testId="`${identifier}.participantRole.role`"
        class="el-radio-group-mt-12"
        :disabled="reviewMode || participantRole.isDone"
      >
        <FdpgRadio
          :test-id-extension="'__' + identifier"
          value="PARTICIPATING_SCIENTIST"
          label="roles.participantRole_PARTICIPATING_SCIENTIST"
        />
        <FdpgRadio :test-id-extension="'__' + identifier" value="RESEARCHER" label="roles.participantRole_RESEARCHER" />
        <FdpgRadio
          :test-id-extension="'__' + identifier"
          value="RESPONSIBLE_SCIENTIST"
          label="roles.participantRole_RESPONSIBLE_SCIENTIST"
        />
      </el-radio-group>
    </FdpgFormItem>
  </el-card>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import { ParticipantRole, type IParticipantRole } from '@/types/proposal.types'
import { requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { onMounted, type PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IParticipantRole>,
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

const participantRole = useVModel(props, 'modelValue', emit)

const formRules = {
  role: requiredValidationFunc(undefined, props.required),
}
</script>
