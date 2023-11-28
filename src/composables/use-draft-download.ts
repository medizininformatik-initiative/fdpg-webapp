import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { Ref } from 'vue'
import { ref } from 'vue'

export default (proposalId: Ref<string>, errorCb?: (...args) => void) => {
  const proposalStore = useProposalStore()
  const isDownloadLoading = ref(false)

  const downloadFile = async () => {
    isDownloadLoading.value = true

    try {
      const file = await proposalStore.getProposalPdfFile(proposalId.value)
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(new Blob([file], { type: 'application/pdf' }))
      link.setAttribute(
        'download',
        proposalStore.currentProposal?.projectAbbreviation
          ? proposalStore.currentProposal.projectAbbreviation
          : 'proposalExport.pdf',
      )
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
