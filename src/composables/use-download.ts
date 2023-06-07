import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { Ref} from 'vue';
import { ref } from 'vue'

export default (proposalId: Ref<string>, errorCb?: (...args) => void) => {
  const proposalStore = useProposalStore()
  const isDownloadLoading = ref(false)

  const downloadFile = async (uploadId: string) => {
    isDownloadLoading.value = true

    try {
      const url = await proposalStore.getDownloadUrl(proposalId.value, uploadId)
      const link = document.createElement('a')
      link.href = url
      link.click()
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.log(error)
      if (errorCb) {
        errorCb()
      }
    }

    isDownloadLoading.value = false
  }

  return {
    downloadFile,
    isDownloadLoading,
  }
}
