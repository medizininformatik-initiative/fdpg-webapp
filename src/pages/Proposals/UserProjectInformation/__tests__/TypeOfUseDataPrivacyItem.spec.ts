import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount } from '@vue/test-utils'
import TypeOfUseDataPrivacyItem from '../TypeOfUseDataPrivacyItem.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  return mount(TypeOfUseDataPrivacyItem, {
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
    props: {
      headline: 'headline',
      text: 'text',
    },
  })
}

type VmType = {
  isExpandingNeeded: boolean
}

describe('TypeOfUseDataPrivacyItem.vue', () => {
  let wrapper: ReturnType<typeof mountComponent> & { vm: VmType }

  beforeEach(() => {
    wrapper = mountComponent() as any
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('unmounts and removes the eventlistener', () => {
    vi.spyOn(window, 'removeEventListener')
    wrapper.unmount()
    expect(window.removeEventListener).toHaveBeenCalledTimes(1)
  })

  it('toggles expand if needed', async () => {
    wrapper.vm.isExpandingNeeded = true

    await flushPromises()
    const button = wrapper.find('button')
    expect(button.text()).toBe('dashboard.showMore')
    await button.trigger('click')
    expect(button.text()).toBe('dashboard.showLess')
  })
})
