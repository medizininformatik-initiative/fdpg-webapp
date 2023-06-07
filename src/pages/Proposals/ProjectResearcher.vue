<template>
  <FdpgLabel required size="medium" class="form-label-mt-4 scrollAnker" html-for="proposal.personalDetails" />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="`${identifier}.researcher.title`" :rules="formRules.title">
          <FdpgLabel html-for="proposal.researcherTitle" />
          <FdpgInput
            v-model="researcher.title"
            class="scrollFocus"
            :data-testId="`${identifier}.researcher.title`"
            placeholder="proposal.pleaseEnterTheResearcherTitle"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="`${identifier}.researcher.firstName`" :rules="formRules.firstName">
          <FdpgLabel html-for="proposal.firstName" />
          <FdpgInput
            v-model="researcher.firstName"
            :data-testId="`${identifier}.researcher.firstName`"
            placeholder="proposal.pleaseEnterTheFirstName"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="`${identifier}.researcher.lastName`" :rules="formRules.lastName">
          <FdpgLabel html-for="proposal.name" />
          <FdpgInput
            v-model="researcher.lastName"
            :data-testId="`${identifier}.researcher.lastName`"
            placeholder="proposal.pleaseEnterTheName"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="`${identifier}.researcher.affiliation`" :rules="formRules.affiliation">
          <FdpgLabel html-for="proposal.belongingOptional" />
          <FdpgInput
            v-model="researcher.affiliation"
            :data-testId="`${identifier}.researcher.affiliation`"
            placeholder="proposal.pleaseEnterTheBelonging"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem :prop="`${identifier}.researcher.email`" :rules="formRules.email">
          <FdpgLabel html-for="proposal.emailAddress" />
          <FdpgInput
            v-model="researcher.email"
            :data-testId="`${identifier}.researcher.email`"
            placeholder="proposal.pleaseEnterTheEmailAddress"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
  <TaskViewer :object-id="researcher._id" />
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import TaskViewer from '@/components/TaskViewer/TaskViewer.vue'
import type { IResearcher } from '@/types/proposal.types'
import { emailValidationFunc, maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<IResearcher>,
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

  identifier: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const researcher = useVModel(props, 'modelValue', emit)

const formRules = {
  title: [maxLengthValidationFunc(100)],
  firstName: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  lastName: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  affiliation: [maxLengthValidationFunc(1000)],
  email: [requiredValidationFunc('string'), emailValidationFunc(), maxLengthValidationFunc(500)],
}
</script>
