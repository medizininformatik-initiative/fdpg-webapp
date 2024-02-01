import { mockProposal } from '@/mocks/proposal.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { IEthicVote, IUpload } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { VueWrapper, mount } from '@vue/test-utils'
import EthicVote from '../EthicVote.vue'
import useUpload from '@/composables/use-upload'
import { DirectUpload, type UploadType } from '@/types/upload.types'
import { ref } from 'vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/composables/use-upload', async () => {
  const ethicVoteUpload = {
    fileName: 'ethicVote.pdf',
    fileSize: 123,
    type: 'ETHIC_VOTE',
    createdAt: '',
    _id: 'ethicVoteId',
  } as IUpload

  const nonResponsibilityUpload = {
    fileName: 'nonResponsibility.pdf',
    fileSize: 123,
    type: 'ETHIC_VOTE_DECLARATION_OF_NON_RESPONSIBILITY',
    createdAt: '',
    _id: 'nonResponsibilityId',
  } as IUpload

  const handleUploadFile = vi.fn()
  const handleRemoveFile = vi.fn()
  const handleRemoveAllOfType = vi.fn()

  return {
    __esModule: true,
    default: vi.fn().mockImplementation((_proposalId: string, uploadtypes: UploadType[], _errorCb: () => void) => {
      return {
        uploadsForType: {
          value: uploadtypes.includes(DirectUpload.EthicVote) ? [ethicVoteUpload] : [nonResponsibilityUpload],
        },
        handleUploadFile,
        handleRemoveFile,
        handleRemoveAllOfType,
        isAppendixLoading: false,
      }
    }),
  }
})

const mountComponent = () => {
  const ethicVote: IEthicVote = JSON.parse(JSON.stringify(mockProposal.userProject.ethicVote))
  return mount(EthicVote, {
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
    props: {
      reviewMode: false,
      modelValue: ethicVote,
    },
  })
}

describe('EthicVote.vue', () => {
  let proposalStore: ReturnType<typeof useProposalStore>
  let wrapper: ReturnType<typeof mountComponent>
  const proposalId = ref('proposalId')
  const mockedUseUpload = vi.mocked(useUpload(proposalId, [DirectUpload.EthicVote], vi.fn()))

  beforeEach(() => {
    wrapper = mountComponent()
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.currentProposal = mockProposal
    vi.clearAllMocks()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  const getUploadComponentByTestId = (testId: string): VueWrapper<any> => {
    const uploadComponents = wrapper.findAllComponents({ name: 'FdpgUpload' })
    return uploadComponents.filter((el) => el.attributes('data-testid') === testId)[0]
  }

  it('should have uploads on the FdpgUpload component', () => {
    const fdpgUpload = getUploadComponentByTestId('ethicVoteForm__upload')

    expect(fdpgUpload.props('fileList').value[0]).toContain({
      fileName: 'ethicVote.pdf',
      _id: 'ethicVoteId',
    })
  })

  describe('When the ethic vote is changed to not required', () => {
    const findAndClickRadioByLabel = async (label: string) => {
      const notRequiredRadio = wrapper.findAll('label').filter((el) => el.text() === label)[0]
      const radio = notRequiredRadio.find<HTMLInputElement>('input[type="radio"]')

      radio.element.checked = true
      await radio.trigger('change')
    }

    it('should emit changes on modelValue', async () => {
      const labelNotRequired = 'proposal.notRequired'
      await findAndClickRadioByLabel(labelNotRequired)

      const emitted = wrapper.emitted()
      const updatesOnModel = emitted['update:modelValue'] as IEthicVote[][]
      expect(updatesOnModel[0][0]).toEqual({
        _id: mockProposal.userProject.ethicVote._id,
        isDone: false,
        isExisting: false,
      })
    })

    it('should remove ethic vote uploads', async () => {
      const labelNotRequired = 'proposal.notRequired'
      await findAndClickRadioByLabel(labelNotRequired)
      expect(mockedUseUpload.handleRemoveAllOfType).toHaveBeenCalledTimes(1)
    })

    it('should have uploads on the FdpgUpload component', async () => {
      const labelNotRequired = 'proposal.notRequired'
      await findAndClickRadioByLabel(labelNotRequired)
      const fdpgUpload = getUploadComponentByTestId('ethicVoteForm__upload__notRequired')
      expect(fdpgUpload.props('fileList').value[0]).toContain({
        fileName: 'nonResponsibility.pdf',
        _id: 'nonResponsibilityId',
      })
    })

    it('should remove remove other uploads when existing is switched back', async () => {
      const labelPresent = 'proposal.present'
      const labelNotRequired = 'proposal.notRequired'
      await findAndClickRadioByLabel(labelNotRequired)
      await findAndClickRadioByLabel(labelPresent)

      expect(mockedUseUpload.handleRemoveAllOfType).toHaveBeenCalledTimes(2)
    })
  })
})
