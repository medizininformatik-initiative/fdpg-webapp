import FdpgInput from '../FdpgInput.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
}))

describe('FdpgInput.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgInput, {
      props: {},
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
