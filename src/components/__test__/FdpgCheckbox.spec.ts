import FdpgCheckbox from '../FdpgCheckbox.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

describe('FdpgCheckbox.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(FdpgCheckbox, {
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-checkbox'],
      },
    })
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
