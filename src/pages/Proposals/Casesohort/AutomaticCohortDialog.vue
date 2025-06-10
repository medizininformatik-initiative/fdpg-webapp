<template>
  <FdpgDialog v-model="dialogOpen" :title="t('proposal.addCohortAutomatic')" width="50%">
    <FdpgLabel html-for="proposal.feasibility" size="medium" />
    <el-card class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem>
            <FdpgLabel html-for="proposal.selectFeasibilityQuery" required />
            <FdpgSelect
              v-model="selectedQuery"
              data-testId="feasibilityForm.id"
              test-id-extension="__feasibilityForm.id"
              placeholder="proposal.referToFeasibilityStudiesOrSimilarThatHaveAlreadyBeenCarriedOut"
              :options="selectableQueries"
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
        <el-button type="primary" @click="add">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useFeasibilityStore } from '@/stores/feasibility.store'
import { useVModel } from '@vueuse/core'
import type { ICohort } from '@/types/proposal.types'
import type { TranslationSchema } from '@/plugins/i18n'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const selectedQuery = ref<ICohort | null>(null)

const isLoading = ref(false)
const noDataText = ref<TranslationSchema>('proposal.noFeasibilityQueriesSaved')

const emit = defineEmits(['update:modelValue', 'add'])

const { t } = useI18n()
const feasibilityStore = useFeasibilityStore()
const dialogOpen = useVModel(props, 'modelValue', emit)

const selectableQueries = computed(() => {
  return feasibilityStore.feasibilityQueries.map((query) => ({
    value: {
      feasibilityQueryId: query.id,
      comment: query.comment,
      label: query.label,
    },
    label: query.label,
  }))
})

const close = () => {
  dialogOpen.value = false
}
const add = () => {
  if (!selectedQuery.value) return

  const newCohort: ICohort = {
    feasibilityQueryId: selectedQuery.value.feasibilityQueryId,
    label: selectedQuery.value.label,
    comment: selectedQuery.value.comment,
    isManualUpload: false,
  }
  emit('add', newCohort)
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
