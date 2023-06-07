<template>
  <FdpgLabel html-for="proposal.feasibility" size="medium" />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.feasibility.id">
          <FdpgLabel
            html-for="proposal.statementsAssessmentOfFeasibility"
            info="proposal.statementsAssessmentOfFeasibilityInfo"
          />
          <FdpgSelect
            v-model="feasibilityForm.id"
            data-testId="feasibilityForm.id"
            test-id-extension="__feasibilityForm.id"
            placeholder="proposal.referToFeasibilityStudiesOrSimilarThatHaveAlreadyBeenCarriedOut"
            :options="selectableQueries"
            :disabled="reviewMode || feasibilityForm.isDone"
            :is-loading="isLoading"
            :no-data-text="noDataText"
            clearable
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.feasibility.details">
          <FdpgLabel html-for="proposal.assessmentOfFeasibilityDetails" />
          <FdpgInput
            v-model="feasibilityForm.details"
            data-testId="feasibilityForm.details"
            placeholder="proposal.pleaseEnterAssessmentOfFeasibilityDetails"
            :disabled="reviewMode || feasibilityForm.isDone"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>

  <TaskViewer :object-id="feasibilityForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { TranslationSchema } from '@/plugins/i18n'
import { useFeasibilityStore } from '@/stores/feasibility.store'
import type { IFeasibility } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType} from 'vue';
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IFeasibility>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const feasibilityStore = useFeasibilityStore()
const feasibilityForm = useVModel(props, 'modelValue', emit)

const selectableQueries = computed(() => {
  return props.reviewMode
    ? []
    : feasibilityStore.feasibilityQueries.map((query) => ({ value: query.id, label: query.label }))
})

const isLoading = ref(false)
const noDataText = ref<TranslationSchema>('proposal.noFeasibilityQueriesSaved')

onMounted(async () => {
  if (!props.reviewMode) {
    isLoading.value = true
    try {
      await feasibilityStore.getAll()
      noDataText.value = 'proposal.noFeasibilityQueriesSaved'
    } catch (error) {
      console.log('TODO: Failed to fetch feasibility queries')
      noDataText.value = 'proposal.noFeasibilityQueriesWhenError'
    }
    isLoading.value = false
  }
})
</script>
