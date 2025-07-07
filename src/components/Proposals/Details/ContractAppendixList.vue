<template>
  <div class="contract-appendix-selection">
    <template v-if="relevantDocuments.length > 0">
      <div class="upload-list">
        <div
          v-for="({ fileName, fileSize, displayType, _id }, index) in filteredDocuments"
          :key="index"
          :class="{ 'upload-list-item--two-columns': twoColumns }"
          class="upload-list-item"
        >
          <i class="bi-file-earmark" aria-hidden="true" />
          <div
            class="upload-file-wrapper"
            tabindex="0"
            @click="handleDownload(_id)"
            @keydown.enter="handleDownload(_id)"
          >
            <div class="upload-file">
              <p class="upload-file__name">{{ fileName }}</p>
              <p class="upload-file__size">{{ $t(displayType) }} {{ (fileSize / 1024).toFixed(1) }} KB</p>
            </div>
            <div class="upload-button-row">
              <el-button link class="file-button" :disabled="isLoading">
                <i class="bi bi-download" aria-hidden="true" />
              </el-button>
              <el-button v-if="!isDisabled" class="file-button" :disabled="isLoading" @click.stop="handleRemove(_id)">
                <i class="fa fa-trash" aria-hidden="true" />
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <el-button v-if="relevantDocuments.length > 2" link @click="handleTogglePanel">
        {{ isCollapsed ? $t('dashboard.showMore') : $t('dashboard.showLess') }}
      </el-button>
    </template>

    <p v-else-if="emptyAlertText" class="documents--empty">
      {{ $t(emptyAlertText) }}
    </p>

    <el-button v-if="relevantDocuments.length < 10 && !isDisabled" type="primary" link @click="handleOpenDialog">
      {{ $t('general.upload') }}
    </el-button>
  </div>

  <FdpgDialog v-model="uploadDialogOpen" :title="t('proposal.uploadType_CONTRACT_APPENDIX')" width="50%">
    <FdpgUpload
      :is-loading="false"
      :is-disabled="false"
      :hide-file-list="false"
      :file-list="relevantDocuments"
      @change="handleUpload"
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
      <div v>{{ uploadedFile.name }}</div>
    </div>

    <template #footer>
      <span>
        <el-button link @click="handleCloseDialog">
          {{ t('general.cancel') }}
        </el-button>
        <el-button type="primary" @click="addContractAppendix" :disabled="isLoading || !uploadedFile">
          {{ t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>

<script setup lang="ts">
import useDownload from '@/composables/use-download'
import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import { type IReportFile, type IUpload } from '@/types/proposal.types'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'
import { DirectUpload, type UploadType } from '@/types/upload.types'
import { useI18n } from 'vue-i18n'
import FdpgDialog from '@/components/FdpgDialog.vue'
import FdpgLabel from '@/components/FdpgLabel.vue'
import FdpgUpload from '@/components/FdpgUpload.vue'
import type { UploadFile } from 'element-plus'

const props = defineProps({
  documents: {
    type: Array as PropType<IUpload[] | IReportFile[]>,
    required: true,
  },
  emptyAlertText: {
    type: String as PropType<TranslationSchema>,
    required: false,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    required: true,
  },
  proposalId: {
    type: String,
    required: false,
    default: '',
  },
  twoColumns: {
    type: Boolean,
    default: false,
  },
})

const { t } = useI18n()

const emit = defineEmits(['remove', 'add'])

const relevantDocuments = computed(() => props.documents.filter((doc) => doc.type === DirectUpload.ContractAppendix))

const proposalId = computed(() => props.proposalId)
const isCollapsed = ref<boolean>(true)
const uploadDialogOpen = ref<boolean>(false)
const uploadedFile = ref<UploadFile | null>(null)

const handleTogglePanel = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleOpenDialog = () => {
  uploadDialogOpen.value = true
}

const handleCloseDialog = () => {
  uploadedFile.value = null
  uploadDialogOpen.value = false
}

const displayTypeMap: Record<UploadType, TranslationSchema> = {
  CONTRACT_APPENDIX: 'proposal.uploadType_CONTRACT_APPENDIX',
}
type MappedType = IUpload & { displayType: TranslationSchema }
const mappedDocuments = computed<MappedType[]>(() => {
  return relevantDocuments.value.map((doc) => {
    let displayType = displayTypeMap[doc.type] ?? 'proposal.uploadType_Fallback'

    return { ...doc, displayType }
  })
})
const filteredDocuments = computed(() => {
  return isCollapsed.value ? mappedDocuments.value.slice(0, 2) : mappedDocuments.value
})
const { showErrorMessage } = useNotifications()

const { downloadFile, isDownloadLoading } = useDownload(proposalId, showErrorMessage)
const handleDownload = async (id: string) => {
  if (!props.isLoading && props.proposalId && !isDownloadLoading.value) {
    await downloadFile(id)
  }
}

const handleUpload = async (file: UploadFile) => {
  uploadedFile.value = file
}

const handleRemove = (id: string) => {
  if (!props.isLoading) {
    emit('remove', id)
  }
}

const addContractAppendix = async () => {
  emit('add', uploadedFile.value)
  handleCloseDialog()
}
</script>

<style lang="scss">
@use '@/assets/sass/variable' as *;

.upload-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 3px;

  .upload-list-item {
    display: flex;
    padding: 4px 4px 3px 9px;
    border-radius: 3px;
    border: 1px solid $gray-700;
    width: 100%;
    cursor: pointer;

    &:hover,
    &:focus {
      box-shadow: 0 0 10px 0 $gray-600;
      border-color: $blue;
    }

    &--two-columns {
      width: 48%;
    }

    .bi-file-earmark {
      color: $blue;
      font-size: 20px;
      margin-right: 10px;
    }

    .upload-file-wrapper {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      .upload-file {
        .upload-file__name {
          color: $blue;
          font-size: 18px;
          margin-top: 2px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .upload-file__size {
          margin-top: 0;
          font-size: 14px;
          margin-bottom: 2px;
        }
      }

      .file-button {
        padding: 0 !important;
        min-height: 30px;
        width: 30px;

        i {
          font-size: 16px !important;
          color: $gray-700;
        }

        &:hover,
        &:focus {
          background: $gray-300;
        }
      }
    }
  }
}

.documents--empty {
  margin: 0;
  padding: 19px 0;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  border-radius: 4px;
  border: 1px solid $gray-700;
}

.display-uploaded {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
</style>
