<template>
  <div class="fdpg-upload-wrapper">
    <el-upload
      action=""
      :accept="accept"
      :multiple="multiple"
      :auto-upload="false"
      :on-change="handleOnChange"
      :disabled="isDisabled || isUploadButtonDisable"
      :show-file-list="false"
      class="fdpg-upload"
    >
      <slot />
    </el-upload>
    <div v-loading="isLoading" />

    <DocumentList
      v-if="!hideFileList && mode !== 'picture'"
      :documents="fileList"
      :proposal-id="proposalId"
      :is-loading="isLoading"
      :is-disabled="isDisabled"
      :empty-alert-text="emptyAlertText"
      @remove="handleRemove"
    />
    <ImageList
      v-if="!hideFileList && mode === 'picture'"
      :documents="fileList"
      :files-to-be-uploaded="filesToBeUploaded"
      :proposal-id="proposalId"
      :is-loading="isLoading"
      :is-disabled="isDisabled"
      :empty-alert-text="emptyAlertText"
      @remove="handleRemove"
    />
  </div>
</template>

<script setup lang="ts">
import type { TranslationSchema } from '@/plugins/i18n'
import type { IReportFile, IUpload } from '@/types/proposal.types'
import type { UploadFile, UploadRawFile } from 'element-plus'
import type { PropType } from 'vue'
import DocumentList from './Proposals/Details/DocumentList.vue'
import ImageList from './Proposals/Details/ImageList.vue'

const props = defineProps({
  fileList: {
    type: Array as PropType<IUpload[] | IReportFile[]>,
    default() {
      return []
    },
    required: false,
  },
  filesToBeUploaded: {
    type: Array as PropType<UploadRawFile[]>,
    default: () => {
      return []
    },
  },
  accept: {
    type: String,
    default: '.*',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    required: true,
  },
  hideFileList: {
    type: Boolean,
    default: false,
  },
  proposalId: {
    type: String,
    required: false,
    default: '',
  },
  emptyAlertText: {
    type: String as PropType<TranslationSchema>,
    default: 'proposal.noAttachmentsYet',
  },
  isUploadButtonDisable: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String as PropType<'document' | 'picture'>,
    default: 'document',
  },
})

const emit = defineEmits(['change', 'remove'])

const handleOnChange = (file: UploadFile) => {
  if (!props.isLoading || !props.isDisabled) {
    emit('change', file)
  }
}

const handleRemove = (id: string) => {
  if (!props.isLoading || !props.isDisabled) {
    emit('remove', id)
  }
}
</script>

<style lang="scss">
@import 'src/assets/sass/variable';

.fdpg-upload-wrapper {
  display: flex;
  flex-direction: column-reverse;
}
</style>
