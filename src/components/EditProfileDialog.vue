<template>
  <FdpgDialog v-model="dialogOpen" width="50%" :title="$t('general.editProfileModalTitle')" :show-close="false">
    <div class="form-group-wrapper">
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="rules"
        class="form-group"
        @validate="handleFieldValidation"
      >
        <el-row :gutter="20">
          <el-col :sm="12">
            <FdpgFormItem prop="salutation">
              <FdpgLabel required html-for="general.salutation" />
              <FdpgSelect
                v-model="profileForm.salutation"
                data-testId="profileForm.salutation"
                placeholder="profileForm.salutation"
                :options="salutations"
              />
            </FdpgFormItem>
          </el-col>
          <el-col :sm="12">
            <FdpgFormItem prop="title">
              <FdpgLabel html-for="proposal.researcherTitle" />
              <FdpgInput
                v-model="profileForm.title"
                data-testId="profileForm.researcherTitle"
                placeholder="proposal.pleaseEnterTheResearcherTitle"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :sm="12">
            <FdpgFormItem prop="firstName">
              <FdpgLabel required html-for="proposal.firstName" />
              <FdpgInput
                v-model="profileForm.firstName"
                data-testId="profileForm.firstName"
                placeholder="proposal.pleaseEnterTheFirstName"
              />
            </FdpgFormItem>
          </el-col>

          <el-col :sm="12">
            <FdpgFormItem prop="lastName">
              <FdpgLabel required html-for="proposal.name" />
              <FdpgInput
                v-model="profileForm.lastName"
                data-testId="profileForm.lastName"
                placeholder="proposal.pleaseEnterTheName"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :sm="24">
            <FdpgFormItem prop="affiliation">
              <FdpgLabel required html-for="proposal.belongingOptional" />
              <FdpgInput
                v-model="profileForm.affiliation"
                data-testId="profileForm.affiliation"
                placeholder="proposal.pleaseEnterTheBelonging"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :sm="24">
            <FdpgFormItem prop="email">
              <FdpgLabel required html-for="proposal.emailAddress" />
              <FdpgInput
                v-model.trim="profileForm.email"
                data-testId="profileForm.email"
                placeholder="proposal.pleaseEnterTheEmailAddress"
              />
            </FdpgFormItem>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeEditProfile" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!isValidToSubmit"
          data-testid="button__confirmEditProfile"
          @click="handleConfirm"
        >
          {{ $t('general.editProfileModalAction') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useUserStore } from '@/stores/user.store'
import { Salutation } from '@/types/salutation.enum'
import type { IUpdateUser } from '@/types/user.types'
import { emailValidationFunc, maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import { ElForm } from 'element-plus'

import type { Ref } from 'vue'
import { computed, reactive, ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgFormItem from './FdpgFormItem.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgLabel from './FdpgLabel.vue'
import FdpgSelect from './FdpgSelect.vue'
import FdpgDialog from './FdpgDialog.vue'
const emit = defineEmits(['update:modelValue', 'closeDialog', 'initiateContract'])

const props = defineProps<{
  modelValue: boolean
}>()

const dialogOpen = useVModel(props, 'modelValue', emit)
const closeDialog = () => {
  dialogOpen.value = false
}

const { showErrorMessage } = useNotifications()
const profileFormRef: Ref<typeof ElForm | undefined> = ref<typeof ElForm>()

const profileForm = reactive<IUpdateUser>({
  salutation: Salutation.Neutral,
  title: '',
  firstName: '',
  lastName: '',
  email: '',
  affiliation: '',
})

const rules = reactive<Record<string, any>>({
  title: [maxLengthValidationFunc(100)],
  firstName: [requiredValidationFunc('string'), maxLengthValidationFunc(100)],
  lastName: [requiredValidationFunc('string'), maxLengthValidationFunc(100)],
  email: [requiredValidationFunc('string'), emailValidationFunc(), maxLengthValidationFunc(250)],
  affiliation: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
})

const { t } = useI18n()
const salutations = computed(() =>
  Object.values(Salutation).map((value) => ({ label: t(`general.salutation_${value}`), value })),
)
const authStore = useAuthStore()
const userStore = useUserStore()

watch(
  dialogOpen,
  async () => {
    if (dialogOpen.value === true) {
      if (authStore.profile?.sub) {
        profileForm.salutation = authStore.profile.salutation ?? Salutation.Neutral
        profileForm.title = authStore.profile.title
        profileForm.firstName = authStore.profile.given_name
        profileForm.lastName = authStore.profile.family_name
        profileForm.affiliation = authStore.profile.affiliation
        profileForm.email = authStore.profile.email
      }

      // To disable the button, we need to trigger the validation.
      // Validation is moved to the next cycle to let the fields being set first
      // Messages are cleared afterwards to not confuse the user
      await nextTick()
      validateForm()
      profileFormRef.value?.clearValidate()
    }
  },
  { immediate: true },
)

const validationState = ref<Record<string, boolean>>({})
const isValidToSubmit = computed(() => {
  return !Object.values(validationState.value).some((value) => value !== true)
})

const handleFieldValidation = (field, value) => {
  validationState.value[field] = value
}

const handleFormValidation = (invalidFields: Record<string, boolean>) => {
  validationState.value = {
    ...validationState.value,
    ...invalidFields,
  }
}

const validateForm = async () => {
  let isValid = false
  await profileFormRef.value?.validate((valid: boolean, invalidFields: Record<string, boolean>) => {
    handleFormValidation(invalidFields)
    isValid = valid
  })
  return isValid
}

const handleConfirm = async () => {
  const isValid = await validateForm()
  if (isValid && authStore.profile?.sub) {
    try {
      await userStore.updateProfile(authStore.profile.sub, profileForm)
      await authStore.loadProfile()
      closeDialog()
    } catch (error) {
      showErrorMessage()
    }
  }
}
</script>
