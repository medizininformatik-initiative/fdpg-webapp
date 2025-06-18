<template>
  <FdpgDialog v-model="dialogOpen" :title="t('proposal.addCohortAutomatic')" width="50%">
    <FdpgLabel html-for="proposal.feasibility" size="medium" />
    <el-card class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem>
            <FdpgLabel html-for="proposal.selectFeasibilityQuery" required />
            <FdpgSelect
              v-model="selectedQueryId"
              data-testId="feasibilityForm.id"
              test-id-extension="__feasibilityForm.id"
              placeholder="proposal.referToFeasibilityStudiesOrSimilarThatHaveAlreadyBeenCarriedOut"
              :options="selectOptions"
              :is-loading="isLoading"
              :no-data-text="noDataText"
              clearable
            />
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-card>
    <template #footer>
      <span>
        <el-button link @click="close">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="add" :disabled="!selectedQueryId">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useFeasibilityStore } from '@/stores/feasibility.store'
import { useVModel } from '@vueuse/core'
import type { ISelectedCohort } from '@/types/proposal.types'
import type { TranslationSchema } from '@/plugins/i18n'
import FdpgSelect from '@/components/FdpgSelect.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  alreadySelected: {
    type: Array as PropType<ISelectedCohort[]>,
    required: true,
    default: () => [],
  },
})
const selectedQueryId = ref<number | undefined>(undefined)

const isLoading = ref(false)
const noDataText = ref<TranslationSchema>('proposal.noFeasibilityQueriesSaved')

const emit = defineEmits(['update:modelValue', 'add'])

const { t } = useI18n()
const feasibilityStore = useFeasibilityStore()
const dialogOpen = useVModel(props, 'modelValue', emit)

const allQueries = computed(() => feasibilityStore.feasibilityQueries || [])

const selectOptions = computed(() => {
  const alreadySelectedFeasibilityIdNonNull = props.alreadySelected
    .filter((c) => c.feasibilityQueryId)
    .map((c) => c.feasibilityQueryId)
  const queriesSelect = allQueries.value
    .filter((query) => !alreadySelectedFeasibilityIdNonNull.includes(query.id))
    .map((query) => ({
      value: query.id,
      label: query.label,
    }))

  return queriesSelect
})

const close = () => {
  dialogOpen.value = false
}

const add = () => {
  if (!selectedQueryId.value) return

  const [selectedQuery] = allQueries.value.filter((query) => query.id === selectedQueryId.value)

  const newCohort: ISelectedCohort = {
    feasibilityQueryId: selectedQuery.id,
    label: selectedQuery.label,
    comment: selectedQuery.comment,
    isManualUpload: false,
    numberOfPatients: undefined,
  }

  emit('add', newCohort)

  selectedQueryId.value = undefined
}

onMounted(async () => {
  isLoading.value = true
  try {
    await feasibilityStore.getAll()

    noDataText.value = 'proposal.noFeasibilityQueriesSaved'
  } catch (error) {
    noDataText.value = 'proposal.noFeasibilityQueriesWhenError'
  }
  isLoading.value = false
})
</script>
