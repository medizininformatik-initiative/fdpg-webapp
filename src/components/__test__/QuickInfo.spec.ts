import QuickInfo from '../QuickInfo.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

describe('QuickInfo.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(QuickInfo, {
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
