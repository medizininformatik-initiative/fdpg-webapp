<template>
  <FdpgDialog v-model="isManualDialogOpen" :title="t('proposal.addCohortManual')" width="50%">
    <el-form v-if="!!proposalId" :model="manualForm" ref="manualFormRef" :rules="rules" class="dialog-form">
      <FdpgFormItem prop="name">
        <FdpgLabel html-for="proposal.cohortName" required />
        <FdpgInput v-model="manualForm.name" :placeholder="'general.inputName'" />
      </FdpgFormItem>

      <FdpgFormItem prop="numberOfPatients">
        <FdpgLabel html-for="proposal.numberOfPatients" required />
        <FdpgNumberInput v-model="manualForm.numberOfPatients" :placeholder="'general.numberOfPatients'" />
      </FdpgFormItem>

      <FdpgFormItem prop="file">
        <FdpgLabel html-for="proposal.cohortFile" required />
        <FdpgUpload
          :accept="'.json'"
          :is-loading="false"
          :is-disabled="false"
          :hide-file-list="true"
          :file-list="uploadsForType"
          @change="handleUpload"
        >
          <el-button class="upload-button" link>
            {{ t('proposal.chooseAFile') }}
            <template #icon>
              <el-icon class="bi-paperclip"></el-icon>
            </template>
          </el-button>
        </FdpgUpload>
      </FdpgFormItem>
      <div v-if="!!manualForm.file" class="display-uploaded">
        <el-icon class="bi-paperclip"></el-icon>
        <div v>{{ manualForm.file.name }}</div>
      </div>
    </el-form>
    <div v-else>{{ t('proposal.saveProposalBeforeUploadingCohorts') }}</div>
    <template #footer>
      <span>
        <el-button link @click="close">
          {{ t('general.cancel') }}
        </el-button>
        <el-button v-if="!!proposalId" type="primary" @click="add">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '@/components/FdpgDialog.vue'
import FdpgFormItem from '@/components/FdpgFormItem.vue'
import FdpgInput from '@/components/FdpgInput.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import { useVModel } from '@vueuse/core'
import type { FormInstance, UploadFile } from 'element-plus'
import useUpload from '@/composables/use-upload'
import { UseCaseUpload } from '@/types/upload.types'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { ISelectedCohort } from '@/types/proposal.types'
import { numberValidationFunc, requiredValidationFunc } from '@/validations'
import FdpgNumberInput from '@/components/FdpgNumberInput.vue'

const { t } = useI18n()
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const manualFormRef = ref<FormInstance | null>(null)
const manualForm = reactive({
  name: '',
  numberOfPatients: undefined as number | undefined,
  file: null as UploadFile | null,
})
const emit = defineEmits(['update:modelValue', 'add', 'close'])
const isManualDialogOpen = useVModel(props, 'modelValue', emit)

const proposalStore = useProposalStore()
const proposalId = computed(() => proposalStore.currentProposal?._id ?? '')

const { showErrorMessage } = useNotifications()
const { uploadsForType } = useUpload(proposalId, [UseCaseUpload.FeasibilityQuery], showErrorMessage)

const handleUpload = async (file: UploadFile) => {
  manualForm.name = file.name?.split?.('.json')?.[0] ?? ''
  manualForm.file = file

  await manualFormRef.value?.validate?.()
}

const validateName = (rule: any, value: string, callback: (err?: Error) => void) => {
  const trimmed = (value || '').trim()
  if (!trimmed) {
    return callback(new Error(t('general.nameMissing')))
  }
  if (/[\\\/:*?"<>|]/.test(trimmed)) {
    return callback(new Error(t('general.invalidCharacters')))
  }
  if (trimmed.toLowerCase().endsWith('.json')) {
    return callback(new Error(t('general.notEndWithJson')))
  }
  callback()
}

const rules = {
  name: [requiredValidationFunc('string'), { validator: validateName, trigger: 'blur' }],
  numberOfPatients: [requiredValidationFunc('number'), numberValidationFunc()],
  file: [
    {
      required: true,
      message: t('general.fileSelect'),
      trigger: 'change',
    },
  ],
}

const add = async () => {
  if (!manualFormRef.value) {
    return false
  }
  const isValid = await manualFormRef.value.validate()
  if (!isValid) {
    return false
  }

  const newCohort: ISelectedCohort = {
    feasibilityQueryId: undefined,
    label: manualForm.name.trim(),
    comment: '',
    isManualUpload: true,
    numberOfPatients: manualForm.numberOfPatients,
  }
  emit('add', newCohort, manualForm.file)
}

const close = () => {
  manualFormRef.value?.resetFields()
  manualForm.file = null
  manualForm.name = ''
  manualForm.numberOfPatients = undefined
  emit('close')
}
</script>

<style scoped>
.dialog-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1em;
}
.display-uploaded {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
