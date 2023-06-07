<template>
  <div class="form-group-wrapper">
    <el-card class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24" :md="12">
          <FdpgFormItem prop="projectResponsible.projectResponsibility.applicantIsProjectResponsible">
            <FdpgLabel html-for="proposal.applicantIsProjectResponsible" />
            <el-checkbox
              v-model="projectResponsible.projectResponsibility.applicantIsProjectResponsible"
              :size="FdpgInputSize.Small"
              :disabled="reviewMode || projectResponsible.projectResponsibility.isDone"
              class="fdpg-checkbox"
              name="applicantIsProjectResponsible"
              data-testId="projectResponsible.projectResponsibility.applicantIsProjectResponsible"
            >
              {{ $t('proposal.applicantIsProjectResponsible') }}</el-checkbox
            >
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-card>

    <TaskViewer :object-id="projectResponsible.projectResponsibility._id" />

    <template v-if="!projectResponsible.projectResponsibility.applicantIsProjectResponsible">
      <ProjectResearcher
        v-model="projectResponsible.researcher"
        :review-mode="reviewMode"
        :form-ref="formRef"
        identifier="projectResponsible"
      ></ProjectResearcher>
      <TaskViewer :object-id="projectResponsible.researcher._id" />

      <ProjectInstitute
        v-model="projectResponsible.institute"
        :review-mode="reviewMode"
        :form-ref="formRef"
        identifier="projectResponsible"
      ></ProjectInstitute>

      <TaskViewer :object-id="projectResponsible.institute._id" />

      <ProjectParticipantCategory
        v-model="projectResponsible.participantCategory"
        :review-mode="reviewMode"
        :form-ref="formRef"
        required
        identifier="projectResponsible"
      ></ProjectParticipantCategory>

      <TaskViewer :object-id="projectResponsible.participantCategory._id" />
    </template>
  </div>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import { FdpgInputSize } from '@/types/component.types'
import type { IProjectResponsible } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import ProjectInstitute from './ProjectInstitute.vue'
import ProjectParticipantCategory from './ProjectParticipantCategory.vue'
import ProjectResearcher from './ProjectResearcher.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectResponsible>,
    required: true,
  },

  formRef: {
    type: Object as PropType<FormInstance>,
    required: false,
    default: () => undefined,
  },

  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const projectResponsible = useVModel(props, 'modelValue', emit)
</script>
