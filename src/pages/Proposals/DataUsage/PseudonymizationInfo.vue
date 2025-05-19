<template>
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.typeOfUse.PseudonymizationInfo">
          <FdpgLabel html-for="proposal.pseudonymizationInfo" size="medium"></FdpgLabel>
          <el-checkbox-group v-model="PseudonymizationInfo" :disabled="reviewMode" class="checkbox-group">
            <div v-for="option in options" :key="`checklist-option-${option.value}`" class="option-container">
              <FdpgCheckbox
                :value="option.value"
                :label="'proposal.pseudonymizationInfo_' + option.value"
                test-id-extension="__pseudonymizationInfoForm"
                :size="FdpgInputSize.Small"
              />
              <FdpgTextEditor
                v-if="PseudonymizationInfo.includes(option.value)"
                v-model="optionTexts[option.value]"
                :disabled="reviewMode"
                :placeholder="t('proposal.textPlaceholder')"
                test-id-extension="__pseudonymizationInfoForm"
              />
            </div>
          </el-checkbox-group>
        </FdpgFormItem>
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
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import { FdpgInputSize } from '@/types/component.types'

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
  pseudonymizationInfoTexts: {
    type: Object as PropType<Record<PseudonymizationInfoOptions, string>>,
    required: true,
  },
})
const emit = defineEmits(['update:modelValue', 'update:pseudonymizationInfoTexts'])
const { t } = useI18n()
const PseudonymizationInfo = useVModel(props, 'modelValue', emit)
const optionTexts = useVModel(props, 'pseudonymizationInfoTexts', emit, {
  deep: true,
  defaultValue: {
    [PseudonymizationInfoOptions.enableRecordLinkage]: '',
    [PseudonymizationInfoOptions.siteGroupingEnabled]: '',
    [PseudonymizationInfoOptions.namedSiteVariable]: '',
  },
})

const options = Object.keys(PseudonymizationInfoOptions).map(function (option) {
  return {
    value: PseudonymizationInfoOptions[option as keyof typeof PseudonymizationInfoOptions],
    info: ('proposal.pseudonymizationInfo_' +
      PseudonymizationInfoOptions[option as keyof typeof PseudonymizationInfoOptions] +
      '_Info') as TranslationSchema,
  }
})
</script>

<style scoped>
.option-container {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>
