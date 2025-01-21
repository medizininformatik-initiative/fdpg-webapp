import FdpgInput from '../FdpgInput.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

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
