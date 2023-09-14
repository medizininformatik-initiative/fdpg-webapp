import { useAuthStore } from '@/stores/auth/auth.store'
import { CardType } from '@/types/component.types'
import type { VueWrapper } from '@vue/test-utils';
import { shallowMount } from '@vue/test-utils'
import FdpgProposalCard from './FdpgProposalCard.vue'
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
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

let authStore: ReturnType<typeof useAuthStore>

describe('FdpgProposalCard.vue', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = shallowMount(FdpgProposalCard, {
      props: {
        proposal: mockProposalDetail,
        type: CardType.Pending,
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
})
