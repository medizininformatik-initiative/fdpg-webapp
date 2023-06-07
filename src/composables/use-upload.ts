import { useProposalStore } from '@/stores/proposal/proposal.store'
import { BadRequestError } from '@/types/bad-request-error.enum'
import type { IUpload } from '@/types/proposal.types'
import type { UploadType } from '@/types/upload.types';
import { DirectUpload } from '@/types/upload.types'
import type { AxiosError } from 'axios';
import axios from 'axios'
import type { UploadFile } from 'element-plus'
import type { Ref} from 'vue';
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default (proposalId: Ref<string>, uploadTypes: UploadType[], errorCb?: (...args) => void) => {
  const { t } = useI18n()
  const proposalStore = useProposalStore()

  const isAppendixLoading = ref(false)

  const uploadsForType = computed<IUpload[]>(() => {
    return proposalStore.currentProposal?.uploads?.filter((upload) => uploadTypes.includes(upload.type)) ?? []
  })

  const handleUploadError = (error: any) => {
    let message: string | undefined
    if (axios.isAxiosError(error) && (error as AxiosError<any, any>).response?.data?.errors) {
      const isWrongMimetype = (error as AxiosError<any, any>).response?.data.errors.find(
        (apiError) => apiError.code === BadRequestError.UploadMimetypeNotSupported,
      )
      if (isWrongMimetype) {
        message = t('general.invalidMimetype')
      }
    }
    if (errorCb) {
      errorCb(message)
    }
  }
  const handleUploadFile = async (file: UploadFile) => {
    isAppendixLoading.value = true
    try {
      const directUploadType = uploadTypes.find((type) =>
        Object.values(DirectUpload).includes(type as DirectUpload),
      ) as DirectUpload
      if (directUploadType && file.raw) {
        await proposalStore.uploadFile(proposalId.value, file.raw, directUploadType)
      } else {
        console.error('Upload not valid for direct upload')
      }
    } catch (error: any) {
      handleUploadError(error)
    }
    isAppendixLoading.value = false
  }

  const handleRemoveFile = async (id: string) => {
    isAppendixLoading.value = true
    const appendix = uploadsForType.value.find((file) => file._id === id)
    if (appendix) {
      try {
        await proposalStore.removeUpload(proposalId.value, id)
      } catch (error: any) {
        if (errorCb) {
          errorCb()
        }
      }
    }

    isAppendixLoading.value = false
  }

  return {
    uploadsForType,
    handleUploadFile,
    handleRemoveFile,
    isAppendixLoading,
  }
}
