import { createTestingPinia } from '@pinia/testing'
import UacMemberDetails from '../Proposals/Details/UacMemberDetails.vue'
import { shallowMount } from '@vue/test-utils'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import type { MockedObject } from 'vitest'
import { mockProposal } from '@/mocks/proposal.mock'
import type { IProposal } from '@/types/proposal.types'
import type { IButtonConfig } from '@/types/button-config.interface'
import { useRouter } from 'vue-router'
import { RouteName } from '@/types/route-name.enum'

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
const mountComponent = (withPinia = true) => {
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return shallowMount(UacMemberDetails, {
    global: {
      plugins,
      stubs: {
        'el-container': false,
      },
    },
    props: {},
  })
}

describe('UacMemberDetails', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  let proposal: IProposal

  beforeEach(() => {
    vi.clearAllMocks()

    createTestingPinia()
    proposal = JSON.parse(JSON.stringify(mockProposal))
    proposalStore = vi.mocked(useProposalStore())
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
      vi.clearAllMocks()

      createTestingPinia()
      proposal = JSON.parse(JSON.stringify(mockProposal))

      proposalStore = vi.mocked(useProposalStore())
      proposalStore.currentProposal = proposal
      proposalStore.setCurrentProposal.mockResolvedValueOnce(proposal)

      wrapper = mountComponent(false) as any
    })

    it('sets the currentProposal', () => {
      expect(proposalStore.setCurrentProposal).toHaveBeenCalledWith('proposalId')
    })

    describe('Handling of top bar buttons', () => {
      it('opens the proposal', () => {
        const router = useRouter()
        const detailTopBar = wrapper.findComponent({ name: 'DetailTopBar' })
        const buttonProps = detailTopBar.props('buttons') as IButtonConfig[]
        const openButton = buttonProps.find((button) => button.label === 'proposal.toTheRequest')
        openButton?.action()

        expect(router.push).toHaveBeenCalledWith({ name: RouteName.ReviewProposal, params: { id: 'proposalId' } })
      })
    })
  })
})
