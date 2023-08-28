import { useMessageBoxStore } from '@/stores/messageBox.store'
import FdpgMessageBox from '../FdpgMessageBox.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { ElButton } from 'element-plus'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((entry) => entry),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('FdpgMessageBox.vue', () => {
  let messageBoxStore: MockedObject<ReturnType<typeof useMessageBoxStore>>
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgMessageBox, {
      props: {},
      global: {
        plugins: [createTestingPinia()],
      },
    })
  })

  beforeEach(() => {
    messageBoxStore = vi.mocked(useMessageBoxStore())
    messageBoxStore.isOpen = true
    messageBoxStore.showCancelButton = true
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should update cancel button text', async () => {
    const cancelButton = wrapper.findAllComponents(ElButton)[0]
    await cancelButton.trigger('click')
    expect(cancelButton.text()).toBe('general.cancel')
  })

  it('should update cancel button text', async () => {
    const cancelButton = wrapper.findAllComponents(ElButton)[1]
    await cancelButton.trigger('click')
    expect(cancelButton.text()).toBe('general.save')
  })
})
