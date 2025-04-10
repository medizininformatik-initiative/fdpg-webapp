<template>
  <FdpgLabel required html-for="proposal.projectDetails" size="medium" />
  <el-card class="form-group">
    <el-row>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.simpleProjectDescription">
          <FdpgLabel html-for="proposal.simpleProjectDescription" />
          <FdpgtextEditor
            v-model="projectDetailsForm.simpleProjectDescription"
            data-testId="projectDetailsForm.simpleProjectDescription"
            :placeholder="t('proposal.describeTheProject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.simpleProjectDescription"
          />
        </FdpgFormItem>
        <FdpgFormItem prop="userProject.projectDetails.executiveSummaryUac">
          <FdpgLabel html-for="proposal.executiveSummaryUac" />
          <FdpgtextEditor
            v-model="projectDetailsForm.executiveSummaryUac"
            data-testId="projectDetailsForm.executiveSummaryUac"
            :placeholder="t('proposal.describeTheProject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.executiveSummaryUac"
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
          <FdpgtextEditor
            v-model="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            data-testId="projectDetailsForm.hypothesisAndQuestionProjectGoals"
            :placeholder="t('proposal.indicationOrRepresentationOfAimsObjectives')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.hypothesisAndQuestionProjectGoals"
          />
        </FdpgFormItem>
        <p class="example">{{ t('proposal.egAccordingToOrFromAbstract') }}</p>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.scientificBackground">
          <FdpgLabel html-for="proposal.scientificBackground" />
          <FdpgtextEditor
            v-model="projectDetailsForm.scientificBackground"
            data-testId="projectDetailsForm.scientificBackground"
            :placeholder="t('proposal.publicationsOnTheSubject')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.scientificBackground"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24">
        <FdpgFormItem prop="userProject.projectDetails.materialAndMethods">
          <FdpgLabel html-for="proposal.materialAndMethods" />
          <FdpgtextEditor
            v-model="projectDetailsForm.materialAndMethods"
            data-testId="projectDetailsForm.materialAndMethods"
            :placeholder="t('proposal.describeTheMaterialsAndMethods')"
            :disabled="reviewMode || projectDetailsForm.isDone"
            :form-ref="formRef"
            field-path="userProject.projectDetails.materialAndMethods"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>

  <TaskViewer :object-id="projectDetailsForm._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import { Department } from '@/types/department.enum'
import type { IProjectDetails } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { PropType } from 'vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgtextEditor from '@/components/FdpgTextEditor.vue'
import type { FormInstance } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectDetails>,
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

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const departments = computed(() =>
  Object.values(Department).map((value) => ({ label: t(`departments.${value}`), value })),
)

const projectDetailsForm = useVModel(props, 'modelValue', emit)
</script>
