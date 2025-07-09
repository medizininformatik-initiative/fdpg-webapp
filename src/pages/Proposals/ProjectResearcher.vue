<template>
  <FdpgLabel required size="medium" class="form-label-mt-4 scrollAnker" html-for="proposal.personalDetails" />
  <el-card class="form-group">
    <el-row :gutter="20">
      <el-col :sm="24" :md="12" v-if="readonly">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.researcher.email` : 'researcher.email'"
          :rules="formRules.email"
        >
          <FdpgLabel html-for="proposal.emailAddress" />
          <FdpgSelect
            v-model="researcher.email"
            :data-testId="identifier ? `${identifier}.researcher.email` : 'researcher.email'"
            :options="formatedExistingUserEmails"
            placeholder="proposal.emailAddress"
            filterable
            class="form-select"
            @change="getUserByEmail"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.researcher.title` : 'researcher.title'"
          :rules="formRules.title"
        >
          <FdpgLabel html-for="proposal.researcherTitle" />
          <FdpgInput
            v-model="researcher.title"
            class="scrollFocus"
            :data-testId="identifier ? `${identifier}.researcher.title` : 'researcher.title'"
            placeholder="proposal.pleaseEnterTheResearcherTitle"
            :disabled="reviewMode || researcher.isDone || readonly"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.researcher.firstName` : 'researcher.firstName'"
          :rules="formRules.firstName"
        >
          <FdpgLabel html-for="proposal.firstName" />
          <FdpgInput
            v-model="researcher.firstName"
            :data-testId="identifier ? `${identifier}.researcher.firstName` : 'researcher.firstName'"
            placeholder="proposal.pleaseEnterTheFirstName"
            :disabled="reviewMode || researcher.isDone || readonly"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.researcher.lastName` : 'researcher.lastName'"
          :rules="formRules.lastName"
        >
          <FdpgLabel html-for="proposal.name" />
          <FdpgInput
            v-model="researcher.lastName"
            :data-testId="identifier ? `${identifier}.researcher.lastName` : 'researcher.lastName'"
            placeholder="proposal.pleaseEnterTheName"
            :disabled="reviewMode || researcher.isDone || readonly"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12">
        <FdpgFormItem
          :prop="identifier ? `${identifier}.researcher.affiliation` : 'researcher.affiliation'"
          :rules="formRules.affiliation"
        >
          <FdpgLabel html-for="proposal.belongingOptional" />
          <FdpgInput
            v-model="researcher.affiliation"
            :data-testId="identifier ? `${identifier}.researcher.affiliation` : 'researcher.affiliation'"
            placeholder="proposal.pleaseEnterTheBelonging"
            :disabled="reviewMode || researcher.isDone || readonly"
          />
        </FdpgFormItem>
      </el-col>
      <el-col :sm="24" :md="12" v-if="!readonly">
        <FdpgFormItem
          v-if="!readonly"
          :prop="identifier ? `${identifier}.researcher.email` : 'researcher.email'"
          :rules="formRules.email"
        >
          <FdpgLabel html-for="proposal.emailAddress" />
          <FdpgInput
            v-model="researcher.email"
            :data-testId="identifier ? `${identifier}.researcher.email` : 'researcher.email'"
            placeholder="proposal.pleaseEnterTheEmailAddress"
            :disabled="reviewMode || researcher.isDone"
          />
        </FdpgFormItem>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgSelect from '@/components/FdpgSelect.vue'
import type { IResearcher } from '@/types/proposal.types'
import { emailValidationFunc, maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { useUserStore } from '@/stores/user.store'
import useNotifications from '@/composables/use-notifications'

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
    required: false,
  },
  existingUserEmails: {
    type: Array as PropType<string[]>,
    required: false,
    default: () => [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})
const userStore = useUserStore()
const emit = defineEmits(['update:modelValue', 'userSelected'])
const { showErrorMessage } = useNotifications()

const researcher = useVModel(props, 'modelValue', emit)

const formRules = {
  title: [maxLengthValidationFunc(100)],
  firstName: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  lastName: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  affiliation: [maxLengthValidationFunc(1000)],
  email: [requiredValidationFunc('string'), emailValidationFunc(), maxLengthValidationFunc(500)],
}
const formatedExistingUserEmails = props.existingUserEmails.map((email) => ({
  label: email,
  value: email,
}))
const getUserByEmail = async (email: string) => {
  if (!email) {
    return
  }
  try {
    const user = await userStore.getUserByEmail(email)
    if (user) {
      emit('userSelected', user)
    } else {
      showErrorMessage('User not found for the provided email.')
    }
  } catch (error) {
    showErrorMessage('Error fetching user by email: ' + error)
  }
}
</script>
<style lang="scss">
.form-select {
  .el-select__wrapper {
    height: 59px;
  }
}

.form-select.fdpg-select .el-select__wrapper .el-select__selection .el-select__input-wrapper .el-select__input {
  margin-left: 0 !important;
  padding-left: 0 !important;
  text-indent: 0 !important;
}
</style>
