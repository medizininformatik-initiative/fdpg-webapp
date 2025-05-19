<template>
  <h2>{{ t('proposal.selectionOfVariablesHeader') }}</h2>

  <template v-if="isDifeSelected && difeSet">
    <div class="form-group-wrapper">
      <el-card class="form-group">
        <el-row>
          <el-col :sm="24">
            <FdpgLabel
              html-for="proposal.informationOnDifeSelectionForVariableSelectionStepHeader"
              required
            ></FdpgLabel>

            <FdpgFormItem class="form-label-mb-3" prop="userProject.variableSelection.DIFE.typeOfUse">
              <FdpgLabel>{{ $t('proposal.userProjectVariableSelectionDifeTypeOfUse') }}</FdpgLabel>
              <FdpgSelect
                v-model="variableSelectionDataForm.DIFE.typeOfUse"
                placeholder="proposal.difeTypeOfUseSelectionPlaceholder"
                :disabled="reviewMode"
                :options="difeTypeOfUseOptions"
              />
            </FdpgFormItem>
          </el-col>

          <el-col :sm="24">
            <FdpgFormItem class="form-label-mb-3" prop="userProject.variableSelection.DIFE.typeOfUseExplanation">
              <FdpgLabel>{{ $t('proposal.userProjectVariableSelectionDifeTypeOfUseExplanation') }}</FdpgLabel>
              <FdpgTextEditor
                v-model="variableSelectionDataForm.DIFE.typeOfUseExplanation"
                :disabled="reviewMode"
                :placeholder="t('proposal.difeTypeOfUseExplanationPlaceholder')"
                :form-ref="formRef"
                field-path="userProject.variableSelection.DIFE.typeOfUseExplanation"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </template>

  <template v-if="isMiiSelected">
    <div class="form-group-wrapper">
      <el-card class="form-group">
        <el-row>
          <el-col :sm="24">
            <FdpgLabel html-for="proposal.informationOnMiiSelectionForVariableSelectionStepHeader"></FdpgLabel>
            <p>{{ t('proposal.informationOnMiiSelectionForVariableSelectionStepBody') }}</p>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </template>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import type { IDifeVariableSelectionData, IVariableSelectionData } from '@/types/proposal.types'
import type { PropType } from 'vue'
import { computed, onMounted, watch } from 'vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import { DifeTypeOfUse } from '@/types/dife-type-of-use.enum'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import { useI18n } from 'vue-i18n'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object as PropType<
      Partial<Record<PlatformIdentifier, IDifeVariableSelectionData | IVariableSelectionData>> | undefined
    >,
    required: true,
    default: () => ({}),
  },

  platform: {
    type: Array as PropType<PlatformIdentifier[]>,
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

const { t } = useI18n()

const isMiiSelected = computed(() => props.platform.includes(PlatformIdentifier.Mii))
const isDifeSelected = computed(() => props.platform.includes(PlatformIdentifier.DIFE))

const difeTypeOfUseOptions = computed(() =>
  Object.keys(DifeTypeOfUse).map((value) => ({ label: t(`proposal.difeTypeOfUse_${value}`), value })),
)
const difeSet = computed(() => !!variableSelectionDataForm?.value?.DIFE)

const emit = defineEmits(['update:modelValue'])

const variableSelectionDataForm = useVModel(props, 'modelValue', emit)

watch(
  () => props.platform,
  () => {
    if (!variableSelectionDataForm.value) {
      variableSelectionDataForm.value = {}
    }

    if (isDifeSelected.value) {
      const previousValue: IDifeVariableSelectionData = variableSelectionDataForm?.value?.DIFE || {
        typeOfUse: undefined,
        typeOfUseExplanation: undefined,
      }

      variableSelectionDataForm.value = {
        ...variableSelectionDataForm.value,
        [PlatformIdentifier.DIFE]: {
          typeOfUse: previousValue.typeOfUse,
          typeOfUseExplanation: previousValue.typeOfUseExplanation,
        },
      }
    } else {
      variableSelectionDataForm.value = { ...variableSelectionDataForm.value, DIFE: undefined }
    }
  },
)

onMounted(() => {
  if (!variableSelectionDataForm.value) {
    variableSelectionDataForm.value = {}
  }

  if (isDifeSelected.value) {
    const defaultDife: IDifeVariableSelectionData = variableSelectionDataForm?.value?.DIFE ?? {
      typeOfUse: undefined,
      typeOfUseExplanation: undefined,
    }

    variableSelectionDataForm.value.DIFE = {
      typeOfUse: defaultDife.typeOfUse,
      typeOfUseExplanation: defaultDife.typeOfUseExplanation,
    }
  }
})
</script>

<style scoped lang="scss">
.fdpg-new-proposal-page .form-label-mb-3 {
  margin-bottom: 0;
}
</style>
