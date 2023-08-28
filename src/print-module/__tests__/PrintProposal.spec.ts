import { shallowMount, type VueWrapper } from '@vue/test-utils'
import PrintProposal from '../pages/PrintProposal.vue'
import { mockProposal } from '@/mocks/proposal.mock'
import { mockDataPrivacyTexts } from '@/mocks/data-privacy.mock'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string, obj?: any) => key + (obj ? JSON.stringify(obj) : '')),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('PrintProposal', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    ;(window as any).data = mockProposal
    ;(window as any).dataPrivacyTexts = mockDataPrivacyTexts
    wrapper = shallowMount(PrintProposal, {
      global: {
        plugins: [],
        stubs: [],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
