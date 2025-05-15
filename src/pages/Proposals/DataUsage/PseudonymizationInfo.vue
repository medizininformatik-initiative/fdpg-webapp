<template>
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgLabel html-for="proposal.PseudonymizationInfo"></FdpgLabel>
        <el-checkbox-group v-model="PseudonymizationInfo" :disabled="reviewMode" class="checkbox-group">
          <div v-for="option in options" :key="`checklist-option-${option.value}`" class="option-container">
            <FdpgCheckbox
              :value="option.value"
              :label="'proposal.pseudonymizationInfo_' + option.value"
              test-id-extension="__pseudonymizationInfoForm"
            />
            <FdpgTextEditor
              v-if="PseudonymizationInfo.includes(option.value)"
              v-model="optionTexts[option.value]"
              :disabled="reviewMode"
              :placeholder="t('proposal.pseudonymizationInfo_' + option.value + '_placeholder')"
              test-id-extension="__pseudonymizationInfoForm"
            />
          </div>
        </el-checkbox-group>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import { computed, type PropType, ref } from 'vue'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { PseudonymizationInfoOptions } from '@/types/PseudonymizationInfo.enum'
import FdpgCheckbox from '@/components/FdpgCheckbox.vue'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import type { TranslationSchema } from '@/plugins/i18n'

const props = defineProps({
  modelValue: {
    type: Object as PropType<PseudonymizationInfoOptions[]>,
    required: true,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const PseudonymizationInfo = useVModel(props, 'modelValue', emit)

const options = Object.keys(PseudonymizationInfoOptions).map(function (option) {
  return {
    value: PseudonymizationInfoOptions[option as keyof typeof PseudonymizationInfoOptions],
    info: ('proposal.pseudonymizationInfo_' +
      PseudonymizationInfoOptions[option as keyof typeof PseudonymizationInfoOptions] +
      '_Info') as TranslationSchema,
  }
})

const optionTexts = ref<Record<string, string>>({})
</script>

<style scoped>
.option-container {
  margin-bottom: 1rem;
}
</style>
