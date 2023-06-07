<template>
  <FdpgDialog
    v-model="dialogOpen"
    class="uac-approval-modal"
    width="50%"
    :title="$t('proposal.uacApprovalModalTitle')"
    :before-close="closeDialog"
  >
    <div>
      <p>{{ $t('proposal.uacApprovalModalDescription') }}</p>
      <el-steps direction="vertical">
        <FdpgStep step-icon-color="blue" :title="$t('proposal.addConditionsOptional')">
          <p>{{ $t('proposal.yourConditionWillBeCheckedByFdpg') }}</p>
          <div v-if="conditionFile" class="fdpg-upload-list-item">
            <p class="fdpg-upload-file__name">{{ conditionFile.name }}</p>
            <span>({{ (conditionFile.size / 1024).toFixed(1) }}KB)</span>
            <el-icon
              class="el-icon-close"
              tabindex="0"
              @click="() => handleRemoveFile()"
              @keydown.enter="handleRemoveFile()"
            />
          </div>
          <FdpgUpload
            accept=".pdf, .doc, .docx"
            :hide-file-list="true"
            :is-loading="false"
            :is-disabled="false"
            @change="handleChangeFileList"
          >
            <el-button v-if="!conditionFile" class="upload-button" type="text">
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </FdpgStep>

        <FdpgStep
          step-icon-color="blue-green"
          :title="$t('proposal.specifyTheAmountOfData')"
          :description="$t('proposal.asADataProviderYouMustSpecifyAQuantity')"
        >
          <p>{{ $t('proposal.asADataProviderYouMustSpecifyAQuantity') }}</p>

          <el-form ref="formRef" class="data-volume" :model="form" :rules="rules" @validate="onValidate">
            <FdpgFormItem prop="dataVolume">
              <FdpgLabel required html-for="proposal.dataVolume" />
              <FdpgNumberInput
                v-model="form.dataVolume"
                placeholder="proposal.acceptContractDataVolumePlaceholder"
                data-testId="input__dataVolume"
              />
            </FdpgFormItem>
          </el-form>
        </FdpgStep>

        <FdpgStep
          step-icon-color="medium-green"
          :title="$t('proposal.sign')"
          :description="$t('proposal.youWillReceiveANotificationAsSoonAsYouCanUploadTheSignedContract')"
        />
      </el-steps>
    </div>

    <template #footer>
      <span>
        <el-button type="text" data-testId="button__closeApprovalDialog" @click="closeDialog">
          {{ $t('general.cancel') }}
        </el-button>
        <el-button
          type="primary"
          :disabled="!isValidToSubmit"
          data-testId="button__uacApproval-accept"
          @click="acceptContract"
        >
          {{ $t('proposal.uacApprovalModalAgreeButton') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'element-plus'
import { reactive, ref } from 'vue'

import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgStep from '@/components/FdpgStep.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import FdpgDialog from '@/components/FdpgDialog.vue'
import { useVModel } from '@vueuse/core'
import { ElForm } from 'element-plus'
import { useI18n } from 'vue-i18n'
import FdpgFormItem from './FdpgFormItem.vue'
import FdpgNumberInput from './FdpgNumberInput.vue'

const emit = defineEmits(['update:modelValue', 'closeDialog', 'acceptContract'])

const props = defineProps<{
  modelValue: boolean
}>()

const dialogOpen = useVModel(props, 'modelValue', emit)

const closeDialog = () => {
  conditionFile.value = null
  form.dataVolume = undefined
  dialogOpen.value = false
}

const conditionFile = ref<UploadFile | null>()

const { t } = useI18n()
const requiredValidation = {
  required: true,
  trigger: ['change', 'blur'],
  message: t('general.requiredField'),
}

const requiredDataVolume = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error(t('general.requiredField')))
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error(t('general.requiredField')))
    } else {
      if (value <= 0) {
        callback(new Error(t('general.requiredField')))
      } else {
        callback()
      }
    }
  }, 1000)
}

const form = reactive({
  dataVolume: undefined,
})

const rules = ref<Record<string, any>>({
  dataVolume: [requiredValidation, { validator: requiredDataVolume, trigger: 'blur' }],
})

const formRef = ref<typeof ElForm>()

const isValidToSubmit = ref<boolean>(false)
const onValidate = (_field, value) => {
  isValidToSubmit.value = value
}

const handleChangeFileList = (file: UploadFile) => {
  conditionFile.value = file
}

const handleRemoveFile = () => {
  conditionFile.value = null
}

const acceptContract = () => {
  if (form.dataVolume && form.dataVolume > 0) {
    emit('acceptContract', form.dataVolume, conditionFile.value)
  }
}
</script>
