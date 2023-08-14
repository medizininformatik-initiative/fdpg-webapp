import { useAuthStore } from '@/stores/auth/auth.store'
import { CardType } from '@/types/component.types'
import { mount } from '@vue/test-utils'
import PanelLocationVote  from './PanelLocationVote.vue'
import { createTestingPinia } from '@pinia/testing'
import { mockProposalDetail } from '@/mocks/proposal.mock'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

let authStore: ReturnType<typeof useAuthStore>

describe('PanelLocationVote.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PanelLocationVote, {
      props: {
        proposal: mockProposalDetail,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-col', 'el-row', 'el-progress'],
      },
    })
  })

  beforeEach(() => {
    authStore = vi.mocked(useAuthStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('computed value should be correct', () => {
    expect(wrapper.vm.voteCount).toEqual(33)
  })
})
