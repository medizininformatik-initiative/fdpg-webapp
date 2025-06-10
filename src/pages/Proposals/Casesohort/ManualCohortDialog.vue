<template>
  <FdpgDialog v-model="isManualDialogOpen" :title="t('proposal.addCohortManual')" width="50%">
    <el-form v-if="!!proposalId" :model="manualForm" ref="manualFormRef" :rules="rules">
      <FdpgFormItem prop="name">
        <FdpgLabel html-for="proposal.cohortName" required />
        <FdpgInput v-model="manualForm.name" />
      </FdpgFormItem>
      <FdpgFormItem prop="file">
        <FdpgLabel html-for="proposal.cohortFile" required />
        <FdpgUpload
          :accept="'.json'"
          :is-loading="false"
          :is-disabled="false"
          :hide-file-list="false"
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
    <div v-else>Please save the proposal beforehand at least once, after that manual uploads will be enabled.</div>
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
import type { ICohort } from '@/types/proposal.types'
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
  file: null as UploadFile | null,
})
const emit = defineEmits(['update:modelValue', 'add'])
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
    return callback(new Error('Name is required'))
  }
  if (/[\\\/:*?"<>|]/.test(trimmed)) {
    return callback(new Error('Name contains invalid characters'))
  }
  if (trimmed.toLowerCase().endsWith('.json')) {
    return callback(new Error('Name should not include “.json”'))
  }
  callback()
}

const rules = {
  name: [{ validator: validateName, trigger: 'blur' }],
  file: [
    {
      required: true,
      message: 'Please select a file',
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

  const newCohort: ICohort = {
    feasibilityQueryId: undefined,
    label: manualForm.name,
    comment: '',
    isManualUpload: true,
  }

  emit('add', newCohort, manualForm.file)
  close()
}

const close = () => {
  isManualDialogOpen.value = false
  manualFormRef.value?.resetFields()
}
</script>

<style scoped>
.display-uploaded {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
