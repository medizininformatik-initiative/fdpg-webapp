import { createTestingPinia } from '@pinia/testing'
import ResearcherDetails from '../Proposals/Details/ResearcherDetails.vue'
import { shallowMount } from '@vue/test-utils'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { MockedObject } from 'vitest'
import useNotifications from '@/composables/use-notifications'
import { mockProposal } from '@/mocks/proposal.mock'
import { ProposalStatus, type IProposal } from '@/types/proposal.types'
import { useRouter } from 'vue-router'
import type { IButtonConfig } from '@/types/button-config.interface'
import { RouteName } from '@/types/route-name.enum'
import { useMessageBoxStore, type IMessageBox } from '@/stores/messageBox.store'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

vi.mock('vue-router', () => {
  const pushMock = vi.fn()
  return {
    useRoute: vi.fn().mockReturnValue({ query: { anchor: 'anchorId' }, params: { id: 'proposalId' } }),
    useRouter: vi.fn(() => ({
      push: pushMock,
    })),
  }
})

vi.mock('@/composables/use-notifications', () => {
  const showSuccessMessage = vi.fn()
  const showErrorMessage = vi.fn()

  return {
    default: vi.fn().mockReturnValue({
      showSuccessMessage,
      showErrorMessage,
    }),
  }
})

const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return shallowMount(ResearcherDetails, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
      },
    },
    props: {},
  })
}

describe('ResearcherDetails', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>

  let proposal: IProposal

  beforeEach(() => {
    vi.clearAllMocks()

    createTestingPinia()
    proposal = JSON.parse(JSON.stringify(mockProposal))
    proposalStore = vi.mocked(useProposalStore())
    commentStore = vi.mocked(useCommentStore())
    messageBoxStore = vi.mocked(useMessageBoxStore())
    proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)
    proposalStore.currentProposal = proposal

    wrapper = mountComponent(false) as any
  })

  describe('In any case', () => {
    let proposal: IProposal

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    beforeEach(() => {
      proposal = JSON.parse(JSON.stringify(mockProposal))

      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      messageBoxStore = vi.mocked(useMessageBoxStore())
      proposalStore.currentProposal = proposal
      proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)

      wrapper = mountComponent(false) as any
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith('proposalId')
    })

    it('fetches the comments', () => {
      expect(commentStore.fetchAll).toHaveBeenCalledWith({ proposalId: 'proposalId' })
    })

    describe('Handling of top bar buttons', () => {
      it('opens the proposal', () => {
        const router = useRouter()
        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.toTheRequest')
        openButton?.action()

        expect(router.push).toHaveBeenCalledWith({ name: RouteName.EditProposal, params: { id: 'proposalId' } })
      })

      it('archives the proposal', async () => {
        const router = useRouter()
        const { showSuccessMessage, showErrorMessage } = useNotifications()

        proposalStore.currentProposal!.status = ProposalStatus.ReadyToArchive

        messageBoxStore.setMessageBoxInfo.mockImplementationOnce(async (config: IMessageBox) => {
          config.callback('confirm')
        })

        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.archiveProject')
        await openButton?.action()

        expect(showSuccessMessage).toHaveBeenCalledWith('general.submitted')
        expect(router.push).toHaveBeenCalledWith({ name: RouteName.Dashboard })
      })
    })
  })
})
