<template>
  <FdpgLabel required html-for="proposal.projectDetails" size="medium" />
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.simpleProjectDescription">
          <FdpgLabel html-for="proposal.simpleProjectDescription" />
          <FdpgInput
            v-model="projectDetailsForm.simpleProjectDescription"
            data-testId="projectDetailsForm.simpleProjectDescription"
            placeholder="proposal.describeTheProject"
            :disabled="reviewMode || projectDetailsForm.isDone"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.department">
          <FdpgLabel html-for="proposal.department" />
          <FdpgSelect
            v-model="projectDetailsForm.department"
            multiple
            filterable
            data-testId="projectDetailsForm.department"
            test-id-extension="__projectDetailsForm.department"
            placeholder="proposal.selectASubjectArea"
            :options="departments"
            :disabled="reviewMode || projectDetailsForm.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.hypothesisAndQuestionProjectGoals">
          <FdpgLabel
            html-for="proposal.hypothesisAndQuestionProjectGoals"
            info="proposal.hypothesisAndQuestionProjectGoalsInfo"
          />
          <FdpgInput
            v-model="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            data-testId="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            placeholder="proposal.indicationOrRepresentationOfAimsObjectives"
            :disabled="reviewMode || projectDetailsForm.isDone"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgFormItem>
        <p class="example">{{ $t('proposal.egAccordingToOrFromAbstract') }}</p>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.scientificBackground">
          <FdpgLabel html-for="proposal.scientificBackground" />
          <FdpgInput
            v-model="projectDetailsForm.scientificBackground"
            data-testId="projectDetailsForm.scientificBackground"
            placeholder="proposal.publicationsOnTheSubject"
            :disabled="reviewMode || projectDetailsForm.isDone"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.materialAndMethods">
          <FdpgLabel html-for="proposal.materialAndMethods" />
          <FdpgInput
            v-model="projectDetailsForm.materialAndMethods"
            data-testId="projectDetailsForm.materialAndMethods"
            placeholder="proposal.describeTheMaterialsAndMethods"
            :disabled="reviewMode || projectDetailsForm.isDone"
            type="textarea"
            :rows="2"
            autosize
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>

  <TaskViewer :object-id="projectDetailsForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import { Department } from '@/types/department.enum'
import type { IProjectDetails } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue';
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectDetails>,
    required: true,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const departments = computed(() =>
  Object.values(Department).map((value) => ({ label: t(`departments.${value}`), value })),
)

const projectDetailsForm = useVModel(props, 'modelValue', emit)
</script>
