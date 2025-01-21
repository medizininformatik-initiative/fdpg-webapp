import FdpgRadio from '../FdpgRadio.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('FdpgRadio.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgRadio, {
      props: {
        value: [true],
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
