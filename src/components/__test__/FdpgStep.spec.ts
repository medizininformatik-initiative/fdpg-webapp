import FdpgStep from '../FdpgStep.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'

describe('FdpgStep.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgStep, {
      props: {
        title: 'str',
        description: 'description',
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-step'],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
