import FdpgInput from '../FdpgInput.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'

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
