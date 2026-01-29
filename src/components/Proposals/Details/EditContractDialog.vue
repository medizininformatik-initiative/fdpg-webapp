<template>
  <!-- Edit Contract Dialog -->
  <FdpgDialog v-model="isOpen" :title="t('proposal.editContract')" width="50%">
    <FdpgUpload
      :is-loading="isContractDraftsLoading"
      :is-disabled="false"
      :hide-file-list="false"
      :file-list="relevantEditContractDocuments"
      @change="handleEditContractUpload"
      :accept="supportedMimetype"
      :proposal-id="proposalId"
      @remove="handleContractDraftRemove"
      :hideRemoveButton="true"
    >
      <el-button class="upload-button" link>
        {{ t('proposal.chooseAFile') }}
        <template #icon>
          <el-icon class="bi-paperclip"></el-icon>
        </template>
      </el-button>
    </FdpgUpload>

    <div v-if="!!uploadedFile" class="display-uploaded">
      <el-icon class="bi-paperclip"></el-icon>
      <div>{{ uploadedFile.name }}</div>
    </div>

    <template #footer>
      <span>
        <el-button link @click="handleCloseDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleEditContract" :disabled="isContractDraftsLoading || !uploadedFile">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UploadFile } from 'element-plus'
import FdpgDialog from '@/components/FdpgDialog.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IUpload } from '@/types/proposal.types'

interface Props {
  modelValue: boolean
  proposalId: string
  contractDrafts: IUpload[]
  isContractDraftsLoading: boolean
  supportedMimetype: string
  uploadId: string | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'remove', id: string): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const proposalStore = useProposalStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

const uploadedFile = ref<UploadFile | null>(null)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const relevantEditContractDocuments = computed<IUpload[]>(() => {
  return props.contractDrafts.filter((doc) => doc._id === props.uploadId)
})

const handleContractDraftRemove = (id: string) => {
  emit('remove', id)
}

const handleCloseDialog = () => {
  uploadedFile.value = null
  isOpen.value = false
}

const handleEditContractUpload = async (file: UploadFile) => {
  uploadedFile.value = file
}

const handleEditContract = async () => {
  const file = uploadedFile.value?.raw

  if (!file || !props.uploadId) {
    showErrorMessage(t('general.pleaseSelectFile'))
    handleCloseDialog()
  } else {
    try {
      await proposalStore.updateContracting(props.proposalId, file as File, props.uploadId)
      showSuccessMessage(t('general.submitted'))

      await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)
      emit('success')
    } catch {
      showErrorMessage(t('general.failedToUploadFile'))
    }

    handleCloseDialog()
  }
}

// Reset uploaded file when dialog closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    uploadedFile.value = null
  }
})
</script>

<style lang="scss" scoped>
.display-uploaded {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
