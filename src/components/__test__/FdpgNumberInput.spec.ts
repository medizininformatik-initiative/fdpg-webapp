import FdpgNumberInput from '../FdpgNumberInput.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { ElInputNumber } from 'element-plus'

describe('FdpgNumberInput.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgNumberInput, {
      props: {},
      global: {
        plugins: [createTestingPinia()],
        stubs: { 'el-input-number': ElInputNumber },
      },
    })
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
