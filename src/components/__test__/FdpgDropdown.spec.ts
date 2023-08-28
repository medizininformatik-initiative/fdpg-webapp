import FdpgDropdown from '../FdpgDropdown.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'

describe('FdpgDropdown.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgDropdown, {
      props: {
        showDropdownIcon: true,
        button: {
          isTranslatable: true,
          label: 'TranslationSchema',
          kind: 'basic',
        },
        items: [
          {
            label: 'TranslationSchema',
            action: () => {},
            kind: 'basic',
          },
        ],
      },
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
