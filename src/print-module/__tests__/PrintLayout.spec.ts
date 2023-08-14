import { shallowMount, type VueWrapper } from '@vue/test-utils'
import PrintLayout from '../PrintLayout.vue'

describe('PrintLayout', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    wrapper = shallowMount(PrintLayout, {
      global: {
        plugins: [],
        stubs: [],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
