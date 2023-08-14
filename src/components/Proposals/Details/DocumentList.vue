<template>
  <template v-if="documents.length > 0">
    <div class="upload-list">
      <div
        v-for="({ fileName, fileSize, displayType, _id }, index) in filteredDocuments"
        :key="index"
        :class="{ 'upload-list-item--two-columns': twoColumns }"
        class="upload-list-item"
      >
        <i class="bi-file-earmark" aria-hidden="true" />
        <div class="upload-file-wrapper" tabindex="0" @click="handleDownload(_id)" @keydown.enter="handleDownload(_id)">
          <div class="upload-file">
            <p class="upload-file__name">{{ fileName }}</p>
            <p class="upload-file__size">{{ $t(displayType) }} {{ (fileSize / 1024).toFixed(1) }} KB</p>
          </div>
          <div class="upload-button-row">
            <el-button type="text" class="file-button" :disabled="isLoading">
              <i class="bi bi-download" aria-hidden="true" />
            </el-button>
            <el-button v-if="!isDisabled" class="file-button" :disabled="isLoading" @click.stop="handleRemove(_id)">
              <i class="fa fa-trash" aria-hidden="true" />
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-button v-if="documents.length > 2" type="text" @click="handleTogglePanel()">
      {{ isCollapsed ? $t('dashboard.showMore') : $t('dashboard.showLess') }}
    </el-button>
  </template>
  <p v-else-if="emptyAlertText" class="documents--empty">
    {{ $t(emptyAlertText) }}
  </p>
</template>

<script setup lang="ts">
import useDownload from '@/composables/use-download'
import useNotifications from '@/composables/use-notifications'
import type { TranslationSchema } from '@/plugins/i18n'
import type { IReportFile, IUpload } from '@/types/proposal.types'
import type { UploadType } from '@/types/upload.types'
import type { PropType } from 'vue'
import { computed, ref } from 'vue'

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

const emit = defineEmits(['remove'])

const proposalId = computed(() => props.proposalId)
const isCollapsed = ref<boolean>(true)

const handleTogglePanel = () => {
  isCollapsed.value = !isCollapsed.value
}
const displayTypeMap: Record<UploadType, TranslationSchema> = {
  CONTRACT_CONDITION: 'proposal.uploadType_CONTRACT_CONDITION',
  CONTRACT_DRAFT: 'proposal.uploadType_CONTRACT_DRAFT',
  ETHIC_VOTE: 'proposal.uploadType_ETHIC_VOTE',
  ETHIC_VOTE_DECLARATION_OF_NON_RESPONSIBILITY: 'proposal.uploadType_ETHIC_VOTE_DECLARATION_OF_NON_RESPONSIBILITY',
  GENERAL_APPENDIX: 'proposal.uploadType_GENERAL_APPENDIX',
  LOCATION_CONTRACT: 'proposal.uploadType_LOCATION_CONTRACT',
  RESEARCHER_CONTRACT: 'proposal.uploadType_RESEARCHER_CONTRACT',
  FEASIBILITY_QUERY: 'proposal.uploadType_FEASIBILITY_QUERY',
  PROPOSAL_PDF: 'proposal.uploadType_PROPOSAL_PDF',
  REPORT_UPLOAD: 'proposal.uploadType_REPORT_UPLOAD',
}
type MappedType = IUpload & { displayType: TranslationSchema }
const mappedDocuments = computed<MappedType[]>(() => {
  return props.documents.map((doc) => {
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

const handleRemove = (id: string) => {
  if (!props.isLoading) {
    emit('remove', id)
  }
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

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
</style>
