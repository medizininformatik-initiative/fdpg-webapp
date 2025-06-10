<template>
  <FdpgLabel :html-for="'proposal.DIFE'" :size="'large'" :info="$t('proposal.difeSelectionOfCases_Info')" />
  <el-card class="form-group form-group-mb-40">
    <FdpgFormItem prop="userProject.selectionOfCases.difeSelectionOfCases.selectedCases">
      <div class="dife-selection-of-variables">
        <FdpgLabel html-for="proposal.difeSelectionOfCasesHeader" size="medium" />

        <el-checkbox-group class="flex-table" v-model="difeSelectionOfCasesForm.selectedCases" :disabled="reviewMode">
          <div v-for="(entry, idx) in entries" :key="idx" class="cell">
            <FdpgCheckbox
              :id="`proposal.difeSelectionOfCases_${entry}`"
              :disabled="reviewMode"
              :label="`proposal.difeSelectionOfCases_${entry}`"
              :value="entry"
              size="small"
            />
          </div>
        </el-checkbox-group>

        <div v-if="isOtherSelected" class="other-explanation">
          <FdpgFormItem prop="userProject.selectionOfCases.difeSelectionOfCases.otherExplanation">
            <FdpgLabel html-for="proposal.difeSelectionOfCases_Other_Header" size="small" />
            <FdpgTextEditor
              v-model:model-value="difeSelectionOfCasesForm.otherExplanation"
              :placeholder="$t('proposal.difeSelectionOfCases_Other_Placeholder')"
              :disabled="reviewMode"
              field-path="userProject.selectionOfCases.difeSelectionOfCases.otherExplanation"
            />
          </FdpgFormItem>
        </div>
      </div>
    </FdpgFormItem>
  </el-card>
</template>

<script setup lang="ts">
import type { PropType, Ref } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { DifeSelectionOfCasesEntries, type IDifeSelectionOfCases } from '@/types/proposal.types'
import FdpgTextEditor from '@/components/FdpgTextEditor.vue'
import { useVModel } from '@vueuse/core'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IDifeSelectionOfCases>,
    required: true,
    default: () => ({}),
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const entries = ref(Object.values(DifeSelectionOfCasesEntries))
const selected: Ref<Set<DifeSelectionOfCasesEntries>> = ref(new Set<DifeSelectionOfCasesEntries>())
const isOtherSelected = computed(() =>
  difeSelectionOfCasesForm.value.selectedCases.includes(DifeSelectionOfCasesEntries.Other),
)

onMounted(() => {
  selected.value = new Set(props.modelValue.selectedCases ?? [])
})

const emit = defineEmits(['update:modelValue'])
const difeSelectionOfCasesForm = useVModel(props, 'modelValue', emit)
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.other-explanation {
  padding: 10px;
}

.fdpg-checkbox {
  margin-right: 10px;

  &.is-checked {
    .el-checkbox__label {
      color: $white;
    }
  }
  &.el-checkbox--small {
    padding: 10px 10px 8px;
  }
}

.flex-table {
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #ddd;
}

.cell {
  flex: 1 1 50%;
  padding: 8px;
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
  border-left: 1px solid #ddd;
}

.cell:nth-child(2n + 1) {
  border-left: none;
}

@media (max-width: 700px) {
  .cell {
    flex-basis: 100%;
    border-left: none;
  }
}
</style>
