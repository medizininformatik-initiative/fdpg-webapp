import FdpgSelect from '../FdpgSelect.vue'
import { createTestingPinia } from '@pinia/testing'
import { shallowMount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

describe('FdpgSelect.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = shallowMount(FdpgSelect, {
      props: {
        modelValue: '',
        options: [],
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          'el-select': true,
          'el-option': true,
          'el-checkbox': true,
        },
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
