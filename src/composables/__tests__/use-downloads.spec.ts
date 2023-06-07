import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useDownload from '../use-download'
import { ref } from 'vue'

describe('UseDownload', () => {
  let proposalStore: vi.MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should generate download URl', async () => {
    const testUrl = 'testUrl'
    const uploadId = 'uploadId'
    const proposalId = ref('proposalId')

    proposalStore.getDownloadUrl.mockResolvedValueOnce(testUrl)

    const { downloadFile } = useDownload(proposalId)

    const linkMock = {
      href: '',
      click: vi.fn(),
    }

    vi.spyOn(document, 'createElement').mockImplementationOnce(() => linkMock as any as HTMLElement)

    await downloadFile(uploadId)

    expect(document.createElement).toBeCalledWith('a')
    expect(linkMock.click).toBeCalledTimes(1)
    expect(linkMock.href).toBe(testUrl)
  })

  it('should run the error callback if the proposalId is not defined', async () => {
    const uploadId = 'uploadId'
    const proposalId = ref('proposalId')
    const errorCb = vi.fn()
    const { downloadFile } = useDownload(proposalId, errorCb)
    vi.spyOn(proposalStore, 'getDownloadUrl').mockRejectedValueOnce(new Error())
    await downloadFile(uploadId)
    expect(errorCb).toBeCalledTimes(1)
  })
})
