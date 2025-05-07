<template>
  <ElCard class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem :prop="`userProject.typeOfUse.targetFormat`" :disabled="reviewMode || typeOfUseForm.isDone">
          <FdpgLabel html-for="proposal.targetFormat" size="medium" />
          <el-radio-group
            v-model="typeOfUseForm.targetFormat"
            data-testId="typeOfUseForm.usage"
            :disabled="reviewMode || typeOfUseForm.isDone"
          >
            <FdpgRadio
              v-for="option in ['CSV', 'FHIR']"
              :value="option"
              :label="option"
              test-id-extension="__typeOfUseForm.targetFormat"
            />
          </el-radio-group>
        </FdpgFormItem>
      </el-col>

      <el-col :sm="24">
        <FdpgFormItem :prop="`userProject.typeOfUse.targetFormatOther`" :disabled="reviewMode || typeOfUseForm.isDone">
          <FdpgLabel html-for="proposal.targetFormatOther" size="small" />
          <FdpgInput
            v-model="typeOfUseForm.targetFormatOther"
            data-testId="typeOfUseForm.targetFormatOther"
            placeholder="proposal.textPlaceholder"
            :disabled="reviewMode || typeOfUseForm.isDone"
            :form-ref="formRef"
            field-path="userProject.typeOfUse.targetFormatDetails"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </ElCard>
</template>

<script setup lang="ts">
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITypeOfUse } from '@/types/proposal.types'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import FdpgInput from '@/components/FdpgInput.vue'
import { useVModel } from '@vueuse/core'

const props = defineProps({
  modelValue: {
    type: Object as PropType<ITypeOfUse>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  platform: {
    type: String as PropType<PlatformIdentifier>,
    required: true,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
})
const emit = defineEmits(['update:modelValue'])

const typeOfUseForm = useVModel(props, 'modelValue', emit)
</script>

<style scoped></style>
