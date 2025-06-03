<template>
  <FdpgLabel :html-for="'DIFE:'" :size="'large'" :info="$t('proposal.difeSelectionOfCases_Info')" />
  <el-card>
    <FdpgFormItem prop="userProject.selectionOfCases.difeSelectionOfCases.selectedCases">
      <div class="dife-selection-of-variables">
        <FdpgLabel html-for="proposal.difeSelectionOfCasesHeader" size="medium" />

        <div class="flex-table">
          <div v-for="(entry, idx) in entries" :key="idx" class="cell">
            <el-checkbox
              class="fdpg-checkbox"
              :model-value="selected.has(entry)"
              :disabled="reviewMode"
              @change="() => onClickEntry(entry)"
            />
            {{ $t(`proposal.difeSelectionOfCases_${entry}`) }}
          </div>
        </div>

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
const isOtherSelected = computed(() => selected.value.has(DifeSelectionOfCasesEntries.Other))

const onClickEntry = (entry: DifeSelectionOfCasesEntries) => {
  const next = new Set(selected.value)
  if (next.has(entry)) {
    next.delete(entry)
  } else {
    next.add(entry)
  }
  selected.value = next
  difeSelectionOfCasesForm.value = {
    ...difeSelectionOfCasesForm.value,
    selectedCases: Array.from(next),
  }
}

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
