import FdpgDropdown from '../FdpgDropdown.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('FdpgDropdown.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgDropdown, {
      props: {
        showDropdownIcon: true,
        button: {
          isTranslatable: true,
          label: 'general.title',
          kind: 'basic',
        },
        items: [
          {
            label: 'header.login',
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
