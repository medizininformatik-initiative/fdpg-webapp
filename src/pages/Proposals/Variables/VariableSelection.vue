<template>
  <h2>{{ t('proposal.selectionOfVariablesHeader') }}</h2>

  <template v-if="isMiiSelected">
    <el-card class="form-group">
      <FdpgLabel html-for="proposal.informationOnMiiSelectionForVariableSelectionStepHeader"></FdpgLabel>
      <p>{{ t('proposal.informationOnMiiSelectionForVariableSelectionStepBody') }}</p>
    </el-card>
  </template>

  <template v-if="isDifeSelected">
    <el-card class="form-group">
      <FdpgLabel html-for="proposal.informationOnDifeSelectionForVariableSelectionStepHeader" required></FdpgLabel>

      <FdpgFormItem prop="userProject.variableSelection.DIFE">
        <FdpgSelect
          v-model="difeRef.typeOfUse"
          placeholder="proposal.difeTypeOfUseSelectionPlaceholder"
          :disabled="reviewMode"
          :options="difeTypeOfUseOptions"
        />
        <FdpgTextEditor
          v-model="difeRef.typeOfUseExplanation"
          :disabled="reviewMode"
          :placeholder="t('proposal.difeTypeOfUseExplanationPlaceholder')"
        />
      </FdpgFormItem>
    </el-card>
  </template>
</template>

<script setup lang="ts">
import FdpgLabel from '@/components/FdpgLabel.vue'
import type { IDataSource, IDifeVariableSelectionData, IProposal } from '@/types/proposal.types'
import type { PropType } from 'vue'
import { computed, onMounted, ref, watch } from 'vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import { DifeTypeOfUse } from '@/types/dife-type-of-use.enum'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import { useI18n } from 'vue-i18n'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProposal | undefined>,
    required: false,
    default: () => undefined,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const isMiiSelected = computed(() =>
  props.modelValue?.selectedDataSources.some((item: IDataSource) => item.tag == PlatformIdentifier.Mii),
)
const isDifeSelected = computed(() =>
  props.modelValue?.selectedDataSources.some((item: IDataSource) => item.tag == PlatformIdentifier.DIFE),
)

const difeTypeOfUseOptions = computed(() =>
  Object.keys(DifeTypeOfUse).map((value) => ({ label: t(`proposal.difeTypeOfUse_${value}`), value })),
)

const difeRef = ref({ typeOfUse: undefined, typeOfUseExplanation: undefined } as IDifeVariableSelectionData)

watch(
  () => difeRef,
  (newValue) => {
    if (!props.modelValue) {
      return
    }
    props.modelValue.userProject.variableSelection = {
      ...(props.modelValue.userProject.variableSelection ?? {}),
      [PlatformIdentifier.DIFE]: newValue.value,
    }
  },
  { deep: true },
)

onMounted(() => {
  const difeValue: IDifeVariableSelectionData | undefined =
    props.modelValue?.userProject?.variableSelection?.[PlatformIdentifier.DIFE]

  if (!!difeValue) {
    difeRef.value.typeOfUse = difeValue.typeOfUse
    difeRef.value.typeOfUseExplanation = difeValue.typeOfUseExplanation
  }
})
</script>
