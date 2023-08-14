import FdpgDialog from '../FdpgDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Dialog } from '@headlessui/vue'

describe('FdpgDialog.vue', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(FdpgDialog, {
      props: {
        modelValue: true,
        title: 'title',
        message: 'message',
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

  it('should emit close and beforeClose method on click', async () => {
    const dialogComponent = await wrapper.findComponent(Dialog)
    dialogComponent.vm.$emit('close', true)
    expect(wrapper.emitted().beforeClose).toBeTruthy()
    expect(wrapper.emitted().close).toBeTruthy()
  })
})
