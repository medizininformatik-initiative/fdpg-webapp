<template>
  <template v-if="decoratedPictureList.length > 0">
    <div class="upload-list">
      <div
        v-for="(item, index) in decoratedPictureList"
        :key="index"
        :class="{ 'upload-list-item--two-columns': twoColumns }"
        class="upload-list-item"
      >
        <div>
          <div
            class="upload-file-wrapper"
            tabindex="0"
            @click="handleDownload(item)"
            @keydown.enter="handleDownload(item)"
          >
            <img :src="item.downloadUrl" :alt="item.fileName" width="200" />
            <div class="upload-button-row">
              <el-button type="text" class="file-button" :disabled="isLoading">
                <i class="bi bi-download" aria-hidden="true" />
              </el-button>
              <el-button
                v-if="!isDisabled"
                class="file-button"
                :disabled="isLoading"
                @click.stop="handleRemove(item._id)"
              >
                <i class="fa fa-trash" aria-hidden="true" />
              </el-button>
            </div>
          </div>
          <span class="upload--name">{{ item.fileName }}</span>
        </div>
      </div>
    </div>
  </template>
  <p v-else-if="emptyAlertText" class="documents--empty">
    {{ $t(emptyAlertText) }}
  </p>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import type { IReportFile, IUpload } from '@/types/proposal.types'
import type { UploadRawFile } from 'element-plus'
import type { PropType } from 'vue'
import { computed } from 'vue'

interface IDecoratedPictureList {
  fileName: string
  downloadUrl: string
  _id: string | number
}
const props = defineProps({
  documents: {
    type: Array as PropType<IUpload[] | IReportFile[]>,
    required: true,
  },
  filesToBeUploaded: {
    type: Array as PropType<UploadRawFile[]>,
    default: () => {
      return []
    },
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

const decoratedPictureList = computed(() => {
  return [...props.filesToBeUploaded, ...props.documents].map((document) => {
    if ((document as any).downloadUrl) {
      const uploadedFile = document as IReportFile
      return {
        fileName: uploadedFile.fileName,
        downloadUrl: uploadedFile.downloadUrl,
        _id: uploadedFile._id,
      }
    } else {
      const toBeUploadedFile = document as UploadRawFile
      return {
        fileName: toBeUploadedFile.name,
        downloadUrl: URL.createObjectURL(toBeUploadedFile),
        _id: toBeUploadedFile.uid,
      }
    }
  })
})

const handleDownload = (item: IDecoratedPictureList) => {
  const a = document.createElement('a')
  a.href = item.downloadUrl
  a.download = item.fileName
  a.click()
  URL.revokeObjectURL(a.href)
}

const handleRemove = (id: string | number) => {
  if (!props.isLoading) {
    emit('remove', id)
  }
}
</script>

<style lang="scss" scoped>
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
    width: 300px;
    cursor: pointer;

    &:hover,
    &:focus {
      box-shadow: 0 0 10px 0 $gray-600;
      border-color: $blue;
    }

    &--two-columns {
      width: 48%;
    }

    .upload-file-wrapper {
      flex: 1;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
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
.upload--name {
  font-size: 14px;
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
