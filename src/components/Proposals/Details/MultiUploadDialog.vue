<template>
  <!-- Multi Upload Dialog -->
  <FdpgDialog v-model="isOpen" :title="t('proposal.addDocuments')" width="60%">
    <div class="multiupload-dialog">
      <div class="upload-section">
        <FdpgUpload
          :is-loading="isUploading"
          :is-disabled="false"
          :hide-file-list="true"
          @change="handleFilesAdd"
          :accept="supportedMimetype"
          :proposal-id="proposalId"
          :multiple="true"
        >
          <el-button class="upload-button" type="primary" plain>
            {{ t('general.upload') }}
            <template #icon>
              <el-icon class="bi-paperclip"></el-icon>
            </template>
          </el-button>
        </FdpgUpload>
      </div>

      <div v-if="fileList.length > 0" class="upload-list">
        <div v-for="(fileItem, index) in fileList" :key="index" class="upload-list-item">
          <i class="bi-file-earmark" aria-hidden="true" />
          <div class="upload-file-wrapper">
            <div class="file-header">
              <p class="upload-file__name" :title="fileItem.file.name">{{ fileItem.file.name }}</p>
              <el-button class="file-button" @click.stop="handleRemoveFile(index)">
                <i class="fa fa-trash" aria-hidden="true" />
              </el-button>
            </div>
            <el-select v-model="fileItem.type" :placeholder="t('proposal.selectDocumentType')" class="type-select">
              <el-option
                v-for="uploadType in uploadTypes"
                :key="uploadType"
                :label="getUploadTypeLabel(uploadType)"
                :value="uploadType"
              >
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <span>
        <el-button link @click="handleCloseDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="handleUpload" :disabled="isUploading || !canUpload">
          {{ t('general.upload') }}
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
import { DirectUpload } from '@/types/upload.types'

interface FileWithType {
  file: UploadFile
  type: DirectUpload | null
}

interface Props {
  modelValue: boolean
  proposalId: string
  uploadTypes: DirectUpload[]
  supportedMimetype: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()
const proposalStore = useProposalStore()
const { showErrorMessage, showSuccessMessage } = useNotifications()

const fileList = ref<FileWithType[]>([])
const isUploading = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const canUpload = computed(() => {
  return fileList.value.length > 0 && fileList.value.every((item) => item.type !== null)
})

const getUploadTypeLabel = (type: DirectUpload): string => {
  const labels: Partial<Record<DirectUpload, string>> = {
    [DirectUpload.GeneralAppendix]: t(`proposal.uploadType_${DirectUpload.GeneralAppendix}`),
    [DirectUpload.EthicVote]: t(`proposal.uploadType_${DirectUpload.EthicVote}`),
    [DirectUpload.EthicVoteDeclarationOfNonResponsibility]: t(
      `proposal.uploadType_${DirectUpload.EthicVoteDeclarationOfNonResponsibility}`,
    ),
    [DirectUpload.AdditionalDocument]: t(`proposal.uploadType_${DirectUpload.AdditionalDocument}`),
    [DirectUpload.ContractAppendix]: t(`proposal.uploadType_${DirectUpload.ContractAppendix}`),
  }
  return labels[type] || type
}

const handleFilesAdd = async (file: UploadFile) => {
  if (file.raw) {
    fileList.value.push({
      file: file,
      type: null,
    })
  }
}

const handleRemoveFile = (index: number) => {
  fileList.value.splice(index, 1)
}

const handleCloseDialog = () => {
  fileList.value = []
  isOpen.value = false
}

const handleUpload = async () => {
  if (!canUpload.value) {
    showErrorMessage(t('proposal.pleaseSelectTypeForAllFiles'))
    return
  }

  isUploading.value = true

  try {
    for (const fileItem of fileList.value) {
      if (fileItem.file.raw && fileItem.type) {
        await proposalStore.uploadFile(props.proposalId, fileItem.file.raw, fileItem.type)
      }
    }

    showSuccessMessage(t('general.submitted'))
    await proposalStore.setCurrentProposal(proposalStore.currentProposal?._id)

    emit('success')
    handleCloseDialog()
  } catch (error) {
    showErrorMessage()
  } finally {
    isUploading.value = false
  }
}

// Reset file list when dialog closes
watch(isOpen, (newValue) => {
  if (!newValue) {
    fileList.value = []
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/sass/variable' as *;

.multiupload-dialog {
  .upload-section {
    margin-bottom: 20px;
  }

  .upload-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 400px;
    overflow-y: auto;
    flex-wrap: nowrap;
  }

  .upload-list-item {
    display: flex;
    padding: 4px 4px 3px 9px;
    border-radius: 3px;
    border: 1px solid $gray-700;
    box-sizing: border-box;
    width: 100%;
    flex-shrink: 0;

    .bi-file-earmark {
      color: $blue;
      font-size: 20px;
      margin-right: 10px;
      flex-shrink: 0;
    }

    .upload-file-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .file-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;

        .upload-file__name {
          flex: 1;
          color: $blue;
          font-size: 18px;
          margin: 2px 0 0 0;
          font-weight: 700;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .file-button {
          padding: 0 !important;
          min-height: 30px;
          width: 30px;
          flex-shrink: 0;

          i {
            font-size: 16px !important;
            color: $gray-900;
          }

          &:hover,
          &:focus {
            background: $gray-300;
          }
        }
      }

      .type-select {
        width: 20em;
        margin-bottom: 1em;
      }
    }
  }
}
</style>
