import TermsDialog from '../TermsDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('TermsDialog.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(TermsDialog, {
      props: { modelValue: true, platform: PlatformIdentifier.Mii },
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
