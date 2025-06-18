<template>
  <FdpgDialog v-model="dialogOpen" :title="t('proposal.addCohortAutomatic')" width="50%">
    <FdpgLabel html-for="proposal.feasibility" size="medium" />
    <el-card class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem>
            <FdpgLabel html-for="proposal.selectFeasibilityQuery" required />
            <FdpgSelect
              v-model="selectedQueryIds"
              multiple
              filterable
              data-testId="feasibilityForm.id"
              test-id-extension="__feasibilityForm.id"
              placeholder="proposal.referToFeasibilityStudiesOrSimilarThatHaveAlreadyBeenCarriedOut"
              :options="selectOptions"
              :is-loading="isLoading"
              :no-data-text="noDataText"
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
        <el-button type="primary" @click="update">
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

const selectedQueryIds = ref<number[]>(
  props.alreadySelected.filter((c) => c.feasibilityQueryId).map((c) => c.feasibilityQueryId as number),
)

const isLoading = ref(false)
const noDataText = ref<TranslationSchema>('proposal.noFeasibilityQueriesSaved')

const emit = defineEmits(['update:modelValue', 'add', 'remove'])

const { t } = useI18n()
const feasibilityStore = useFeasibilityStore()
const dialogOpen = useVModel(props, 'modelValue', emit)

const allQueries = computed(() => feasibilityStore.feasibilityQueries || [])

const selectOptions = computed(() => {
  const queriesSelect = allQueries.value.map((query) => ({
    value: query.id,
    label: query.label,
  }))

  return queriesSelect
})

const close = () => {
  dialogOpen.value = false
}

const update = () => {
  const alreadySelectedFeasibilityIds = props.alreadySelected
    .filter((c) => c.feasibilityQueryId)
    .map((c) => c.feasibilityQueryId as number)

  const newCohorts = selectedQueryIds.value
    .filter((queryId) => !alreadySelectedFeasibilityIds.includes(queryId))
    .map(mapQueryIdToSelectedCohort)
  const removedCohorts = alreadySelectedFeasibilityIds
    .filter((queryId) => !selectedQueryIds.value.includes(queryId))
    .map(mapQueryIdToSelectedCohort)

  if (newCohorts.length > 0) {
    emit('add', newCohorts)
  }
  if (removedCohorts.length > 0) {
    emit('remove', removedCohorts)
  }

  close()
}

const mapQueryIdToSelectedCohort = (queryId: number) => {
  if (
    props.alreadySelected
      .filter((c) => c.feasibilityQueryId && c.uploadId)
      .map((c) => c.feasibilityQueryId)
      .includes(queryId)
  ) {
    const [persisted] = props.alreadySelected.filter((c) => c.feasibilityQueryId == queryId)
    return persisted
  }

  const [selectedQuery] = allQueries.value.filter((query) => query.id === queryId)
  const cohort: ISelectedCohort = {
    feasibilityQueryId: selectedQuery.id,
    label: selectedQuery.label,
    comment: selectedQuery.comment,
    isManualUpload: false,
    numberOfPatients: undefined,
  }

  return cohort
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
