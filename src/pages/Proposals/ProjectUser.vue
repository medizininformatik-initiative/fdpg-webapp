<template>
  <div class="form-group-wrapper">
    <el-card class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24" :md="24">
          <FdpgFormItem prop="projectUser.projectUserType">
            <el-radio-group
              v-model="projectUser.projectUserType"
              data-testId="projectUser.projectUserType"
              class="el-radio-group-mt-12"
              :disabled="reviewMode || projectUser.isDone"
            >
              <FdpgRadio
                :value="ProjectUserType.ApplicantAsPrivatePerson"
                label="proposal.projectUserType_APPLICANT_AS_PRIVATE_PERSON"
              />
              <FdpgRadio
                :value="ProjectUserType.OrganizationOfProjectResponsible"
                label="proposal.projectUserType_ORGANIZATION_OF_PROJECT_RESPONSIBLE"
              />
            </el-radio-group>
          </FdpgFormItem>
        </el-col>
      </el-row>
    </el-card>
    <TaskViewer :object-id="projectUser._id" />
  </div>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgRadio from '@/components/FdpgRadio.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IProjectUser } from '@/types/proposal.types'
import { ProjectUserType } from '@/types/proposal.types'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IProjectUser>,
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

const projectUser = useVModel(props, 'modelValue', emit)
</script>
