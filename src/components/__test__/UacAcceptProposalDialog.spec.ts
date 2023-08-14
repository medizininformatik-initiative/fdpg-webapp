import UacAcceptProposalDialog from '../UacAcceptProposalDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))
describe('UacAcceptProposalDialog.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(UacAcceptProposalDialog, {
      props: { modelValue: true },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
