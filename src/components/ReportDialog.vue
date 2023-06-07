<template>
  <FdpgDialog
    v-model="dialogOpen"
    :title="!report._id ? $t('proposal.addReport') : $t('proposal.editReport')"
    class="reports--modal"
    @close="closeDialog"
  >
    <el-form ref="ReportFormRef" :rules="rules" label-position="top" :model="report" class="form-group">
      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem prop="title">
            <FdpgLabel required html-for="general.title" />
            <FdpgInput
              v-model="report.title"
              data-testId="report.title"
              placeholder="proposal.reportTitlePlaceholder"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :sm="24">
          <FdpgFormItem prop="content">
            <FdpgLabel html-for="proposal.text" />
            <FdpgInput
              v-model="report.content"
              type="textarea"
              data-testId="report.content"
              placeholder="proposal.reportContentPlaceholder"
            />
          </FdpgFormItem>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <FdpgUpload
            accept=".jpg, .png, .bmp, .gif, .tiff, .svg"
            empty-alert-text="proposal.reportUploadPlaceholder"
            :hide-file-list="false"
            :file-list="uploadedFiles"
            :files-to-be-uploaded="filesToBeUploaded"
            :is-loading="false"
            :is-upload-button-disable="!!(uploadedFiles?.length + filesToBeUploaded?.length > 2)"
            :is-disabled="false"
            mode="picture"
            @change="handleChangeFileList"
            @remove="handleRemoveFileList"
          >
            <el-button
              class="upload-button"
              type="text"
              :class="{ 'disable-button': !!(uploadedFiles?.length + filesToBeUploaded?.length > 2) }"
            >
              {{ $t('proposal.chooseAFile') }}
              <template #icon>
                <el-icon class="bi-paperclip"></el-icon>
              </template>
            </el-button>
          </FdpgUpload>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span>
        <el-button type="text" @click="closeDialog">{{ $t('general.cancel') }}</el-button>
        <el-button :disabled="isSaveButtonDisabled" type="primary" @click="createOrUpdateReport">
          {{ $t('general.save') }}
        </el-button>
      </span>
    </template>
  </FdpgDialog>
</template>
<script setup lang="ts">
import useNotifications from '@/composables/use-notifications'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IReportCreate, IReportFile, IReportGet, IReportUpdate, IUpload } from '@/types/proposal.types'
import { maxLengthValidationFunc, requiredValidationFunc } from '@/validations'
import { useVModel } from '@vueuse/core'
import type { UploadFile } from 'element-plus'
import { ElForm, type UploadRawFile } from 'element-plus'
import type { PropType, Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import FdpgDialog from './FdpgDialog.vue'
import FdpgFormItem from './FdpgFormItem.vue'
import FdpgInput from './FdpgInput.vue'
import FdpgLabel from './FdpgLabel.vue'
import FdpgUpload from './FdpgUpload.vue'

const { showErrorMessage } = useNotifications()
const ReportFormRef: Ref<typeof ElForm | undefined> = ref<typeof ElForm>()
const emit = defineEmits(['update:modelValue', 'reset', 'update:report'])
const isSaveButtonDisabled = ref<boolean>(false)
const props = defineProps({
  report: {
    type: Object as PropType<IReportGet>,
    required: true,
  },
  proposalId: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
})
const dialogOpen = useVModel(props, 'modelValue', emit)
const filesToBeUploaded = ref<UploadRawFile[]>([])
const uploadedFiles = ref<IReportFile[]>([])
const keepUploads = ref<string[]>([])

watch(dialogOpen, async (newModelValue) => {
  if (newModelValue) {
    if (props.report._id) {
      const content = await proposalStore.getReportContent(props.proposalId, props.report._id)
      emit('update:report', { ...props.report, content })
      uploadedFiles.value = props.report.uploads
      keepUploads.value = props.report.uploads.map((upload) => upload._id)
    }
  }
})

const handleChangeFileList = (file: UploadFile) => {
  if (file.raw) {
    filesToBeUploaded.value = filesToBeUploaded.value?.length ? [...filesToBeUploaded.value, file?.raw] : [file?.raw]
  }
}
const handleRemoveFileList = (id: string | number) => {
  filesToBeUploaded.value = filesToBeUploaded.value?.filter((file: UploadRawFile) => file.uid !== id)
  keepUploads.value = keepUploads.value?.filter((uploadId) => uploadId !== id)
  uploadedFiles.value = uploadedFiles.value?.filter((file: IUpload) => file._id !== id)
}
const proposalStore = useProposalStore()
const report = computed(() => props.report)
const rules = ref<Record<string, any>>({
  title: [requiredValidationFunc('string'), maxLengthValidationFunc(250)],
  content: [requiredValidationFunc('string')],
})
const closeDialog = () => {
  dialogOpen.value = false
  ReportFormRef.value?.clearValidate()
  uploadedFiles.value = []
  filesToBeUploaded.value = []
  keepUploads.value = []
  emit('reset')
}
const createOrUpdateReportValues = ref<{ title: string; content: string; uploads: File[] }>()
const createOrUpdateReport = async () => {
  isSaveButtonDisabled.value = true
  await ReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      createOrUpdateReportValues.value = {
        title: report.value.title,
        content: report.value.content,
        uploads: filesToBeUploaded.value,
      }
      try {
        if (!report.value._id) {
          await proposalStore.createProposalReport(props.proposalId, {
            ...createOrUpdateReportValues.value,
            files: createOrUpdateReportValues.value.uploads,
          } as IReportCreate)
        } else {
          await proposalStore.updateProposalReport(props.proposalId, report.value._id, {
            title: createOrUpdateReportValues.value.title,
            content: createOrUpdateReportValues.value.content,
            files: createOrUpdateReportValues.value.uploads,
            keepUploads: keepUploads.value,
          } as IReportUpdate)
        }
      } catch (error) {
        showErrorMessage()
      }
      closeDialog()
    }
    isSaveButtonDisabled.value = false
  })
}
</script>
<style lang="scss" scoped>
@import 'src/assets/sass/variable';

.disable-button {
  cursor: not-allowed;
  opacity: 0.3;
}
.form-element {
  margin-bottom: 0;

  &.is-error {
    .el-form-item__content {
      .fdpg-label {
        color: $red;
      }

      .fdpg-input,
      .fdpg-select,
      .fdpg-date-picker {
        &.is-focus {
          .el-input__inner {
            border-color: $red;
          }
        }

        .el-input__inner {
          &:hover {
            border-color: $red;
          }

          &:focus {
            box-shadow: 0 0 10px -5px $red;
          }
        }
      }

      .el-form-item__error {
        position: initial;
      }
    }
  }
}
</style>
