import { createTestingPinia } from '@pinia/testing'
import { flushPromises, shallowMount } from '@vue/test-utils'
import ReviewProposal from '../ReviewProposal.vue'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { useCommentStore } from '@/stores/comment/comment.store'
import type { MockedObject } from 'vitest'
import useNotifications from '@/composables/use-notifications'
import type { IProposal } from '@/types/proposal.types'
import { mockProposal } from '@/mocks/proposal.mock'
import { useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

vi.mock('vue-router', () => {
  const pushMock = vi.fn()
  return {
    useRoute: vi.fn().mockReturnValue({ query: { anchor: 'anchorId' }, params: { id: '630dd9e8c8a548d21ef4c356' } }),
    useRouter: vi.fn(() => ({
      push: pushMock,
    })),
  }
})

vi.mock('@/composables/use-notifications', () => ({
  default: vi.fn().mockReturnValue({
    showSuccessMessage: vi.fn(),
    showErrorMessage: vi.fn(),
  }),
}))

const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return shallowMount(ReviewProposal, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
        'el-form': false,
        'el-row': false,
        'el-col': false,
        'el-button': false,
      },
    },
    props: {},
  })
}

describe('ReviewProposal', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let commentStore: MockedObject<ReturnType<typeof useCommentStore>>

  const { showErrorMessage } = useNotifications()

  const anchorMock = {
    scrollIntoView: vi.fn(),
  }

  const getButtonByText = (text: string) => {
    const buttons = wrapper.findAll('button')
    return buttons.filter((button) => button.text() === text)[0]
  }

  describe('In any case', () => {
    let proposal: IProposal

    it('renders', () => {
      expect(wrapper).toBeTruthy()
    })

    beforeEach(() => {
      vi.clearAllMocks()
      vi.spyOn(document, 'getElementById').mockReturnValue(anchorMock as any)

      createTestingPinia()
      proposal = JSON.parse(JSON.stringify(mockProposal))

      proposalStore = vi.mocked(useProposalStore())
      commentStore = vi.mocked(useCommentStore())
      proposalStore.currentProposal = proposal
      proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)

      wrapper = mountComponent(false) as any
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith(proposal._id)
    })

    it('fetches the comments', () => {
      expect(commentStore.fetchAll).toHaveBeenCalledWith({ proposalId: proposal._id })
    })

    it('scrolls to the anchor', async () => {
      await flushPromises()
      expect(anchorMock.scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
    })

    it('navigates to the detail page on detail button press', async () => {
      const router = useRouter()
      const button = getButtonByText('proposal.projectDetails')
      await button.trigger('click')
      expect(router.push).toHaveBeenCalledWith({ name: RouteName.ProposalDetails, params: { id: proposal._id } })
    })
  })

  describe('Unhappy paths', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
    describe('On mounted when the proposal fails to be set', () => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        proposalStore.setCurrentProposal.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })

      it('routes back to the dashboard', async () => {
        const router = useRouter()
        expect(router.push).toHaveBeenCalledWith({ name: RouteName.Dashboard })
      })
    })

    describe('On mounted when the comments fail to be loaded', () => {
      beforeEach(() => {
        createTestingPinia()
        proposalStore = vi.mocked(useProposalStore())
        proposalStore.setCurrentProposal.mockResolvedValueOnce(mockProposal)
        commentStore = vi.mocked(useCommentStore())
        commentStore.fetchAll.mockRejectedValueOnce(new Error('error'))
        wrapper = mountComponent(false) as any
      })

      it('shows an error message', async () => {
        await flushPromises()
        expect(showErrorMessage).toHaveBeenCalledTimes(1)
      })
    })
  })
})
