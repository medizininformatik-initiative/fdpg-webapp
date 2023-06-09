import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { mockProposal } from '@/mocks/proposal.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { BadRequestError } from '@/types/bad-request-error.enum'
import { DirectUpload, UseCaseUpload } from '@/types/upload.types'
import { createTestingPinia } from '@pinia/testing'
import { AxiosError } from 'axios'
import type { UploadFile, UploadRawFile } from 'element-plus'
import { setActivePinia } from 'pinia'
import type { MockedObject } from 'vitest'
import { ref } from 'vue'
import useUpload from '../use-upload'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('UseNotifications', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
    proposalStore.currentProposal = mockProposal
  })

  test.each([UseCaseUpload.ContractCondition, DirectUpload.EthicVote])(
    'check UseCaseUpload type',
    (uploadType: UseCaseUpload | DirectUpload) => {
      const proposalId = ref<string>(proposalStore.currentProposal?._id || '0')
      const mockFile = vi.mocked({
        name: 'a',
        status: 'ready',
        size: 10,
        uid: 10,
        raw: { ...new File(['a'], 'asdf'), uid: 10 } as UploadRawFile,
      } as UploadFile)
      const { uploadsForType, handleUploadFile } = useUpload(proposalId, [uploadType])
      expect(uploadsForType.value).toStrictEqual(
        proposalStore.currentProposal?.uploads?.filter((upload) => uploadType === upload.type),
      )
      handleUploadFile(mockFile)

      if (uploadType === DirectUpload.EthicVote) {
        expect(proposalStore.uploadFile).toBeCalledTimes(1)
      } else {
        expect(proposalStore.uploadFile).not.toBeCalled()
      }
    },
  )

  it('should handle removing files', async () => {
    const proposalId = ref<string>(proposalStore.currentProposal?._id || '0')

    const { handleRemoveFile } = useUpload(proposalId, [DirectUpload.EthicVote])
    const mockId = proposalStore.currentProposal?.uploads?.filter((upload) => DirectUpload.EthicVote === upload.type)[0]
      ._id
    handleRemoveFile(mockId as string)
    expect(proposalStore.removeUpload).toBeCalled()
  })

  it('should check the error handling in upload file function with mimetype error', async () => {
    const proposalId = ref<string>(proposalStore.currentProposal?._id || '0')
    const mockFile = vi.mocked({
      name: 'a',
      status: 'ready',
      size: 10,
      uid: 10,
      raw: { ...new File(['a'], 'asdf'), uid: 10 } as UploadRawFile,
    } as UploadFile)
    const errorCb = vi.fn()
    const { uploadsForType, handleUploadFile } = useUpload(proposalId, [DirectUpload.EthicVote], errorCb)
    const error = new AxiosError()
    error.response = {
      data: {
        errors: [{ code: BadRequestError.UploadMimetypeNotSupported }],
      },
    } as any
    vi.spyOn(proposalStore, 'uploadFile').mockRejectedValueOnce(error)

    expect(uploadsForType.value).toStrictEqual(
      proposalStore.currentProposal?.uploads?.filter((upload) => DirectUpload.EthicVote === upload.type),
    )
    await handleUploadFile(mockFile)
    expect(errorCb).toHaveBeenCalledWith('general.invalidMimetype')
  })

  it('should check the error handling in upload file function with mimetype error', async () => {
    const proposalId = ref<string>(proposalStore.currentProposal?._id || '0')
    const mockFile = vi.mocked({
      name: 'a',
      status: 'ready',
      size: 10,
      uid: 10,
      raw: { ...new File(['a'], 'asdf'), uid: 10 } as UploadRawFile,
    } as UploadFile)
    const errorCb = vi.fn()
    const { uploadsForType, handleUploadFile } = useUpload(proposalId, [DirectUpload.EthicVote], errorCb)
    const error = new Error('error')
    vi.spyOn(proposalStore, 'uploadFile').mockRejectedValueOnce(error)

    expect(uploadsForType.value).toStrictEqual(
      proposalStore.currentProposal?.uploads?.filter((upload) => DirectUpload.EthicVote === upload.type),
    )
    await handleUploadFile(mockFile)
    expect(errorCb).toBeCalledTimes(1)
    expect(errorCb).toHaveBeenCalledWith(undefined)
  })

  it('should check the error handling in remove file function', async () => {
    const proposalId = ref<string>(proposalStore.currentProposal?._id || '0')
    const errorCb = vi.fn()
    const { uploadsForType, handleRemoveFile } = useUpload(proposalId, [DirectUpload.EthicVote], errorCb)

    const error = new Error('error')

    vi.spyOn(proposalStore, 'removeUpload').mockRejectedValueOnce(error)

    expect(uploadsForType.value).toStrictEqual(
      proposalStore.currentProposal?.uploads?.filter((upload) => DirectUpload.EthicVote === upload.type),
    )

    const mockId = proposalStore.currentProposal?.uploads?.filter((upload) => DirectUpload.EthicVote === upload.type)[0]
      ._id
    await handleRemoveFile(mockId as string)
    expect(errorCb).toHaveBeenCalledTimes(1)
  })
})
