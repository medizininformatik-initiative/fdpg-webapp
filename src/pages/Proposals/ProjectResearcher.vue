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
            :options="emailOptions"
            placeholder="proposal.emailAddress"
            filterable
            remote
            :remote-method="searchEmails"
            :loading="isSearching"
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
import type { IApplicant, IResearcher } from '@/types/proposal.types'
import { emailValidationFunc, maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { FormInstance } from 'element-plus'
import type { PropType } from 'vue'
import { ref, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user.store'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
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

  readonly: {
    type: Boolean,
    default: false,
  },
})
const userStore = useUserStore()
const proposalStore = useProposalStore()
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
const emailOptions = ref<{ label: string; value: string }[]>([])
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const currentApplicantEmail = computed(() => proposalStore.currentProposal?.applicant?.researcher?.email ?? '')
const currentParticipantsEmails = computed(() => {
  return (
    proposalStore.currentProposal?.participants
      .filter((p) => p.researcher?.email)
      .map((p) => p.researcher.email.toLowerCase()) ?? []
  )
})
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

const searchEmails = async (query: string) => {
  if (!query || query.trim().length < 3) {
    emailOptions.value = []
    return
  }

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Debounce search
  searchTimeout = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await userStore.searchEmailsByPrefix(query.trim())
      const currentEmail = currentApplicantEmail.value.toLowerCase()
      emailOptions.value = response.emails
        .filter((email) => email.toLowerCase() !== currentEmail)
        .filter((email) => !currentParticipantsEmails.value.includes(email.toLowerCase()))
        .map((email) => ({ label: email, value: email }))
    } catch (error) {
      showErrorMessage('Error searching emails: ' + error)
      emailOptions.value = []
    } finally {
      isSearching.value = false
    }
  }, 300)
}

// Cleanup timeout on component unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
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
