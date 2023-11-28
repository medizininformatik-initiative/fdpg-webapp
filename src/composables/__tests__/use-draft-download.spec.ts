import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useDraftDownload from '../use-draft-download'
import { ref } from 'vue'
import type { MockedObject } from 'vitest'

describe('UseDraftDownload', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should call the service to generate and download pdf proposal', async () => {
    const store = useProposalStore()
    const proposalId = ref('proposalId')

    const { downloadFile } = useDraftDownload(proposalId)

    const linkMock = {
      href: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
    }

    vi.spyOn(document, 'createElement').mockImplementationOnce(() => linkMock as unknown as HTMLAnchorElement)

    await downloadFile()

    expect(store.getProposalPdfFile).toHaveBeenCalledWith(proposalId.value)

    expect(document.createElement).toBeCalledWith('a')
    expect(linkMock.setAttribute).toBeCalledTimes(1)
    expect(linkMock.click).toBeCalledTimes(1)
  })

  it('should run the error callback if the proposalId is not defined', async () => {
    const proposalId = ref('proposalId')
    const errorCb = vi.fn()
    const { downloadFile } = useDraftDownload(proposalId, errorCb)
    vi.spyOn(proposalStore, 'getProposalPdfFile').mockRejectedValueOnce(new Error())
    await downloadFile()
    expect(errorCb).toBeCalledTimes(1)
  })
})
