import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import FdpgHeader from '../FdpgHeader.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import FdpgDropdown from '../FdpgDropdown.vue'

import type { DropdownItem, IDropdownIconItem } from '@/types/dropdown.types'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))
vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

const mountComponent = () => {
  return mount(FdpgHeader, {
    props: {},
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
  })
}

describe('FdpgHeader.vue', () => {
  let layoutStore: MockedObject<ReturnType<typeof useLayoutStore>>
  let wrapper: ReturnType<typeof mountComponent>
  beforeEach(() => {
    wrapper = mountComponent()
    layoutStore = vi.mocked(useLayoutStore())
    layoutStore.isSidebarVisible = false
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should open sidebar', async () => {
    await wrapper.find('.fdpg-header__menu-button').trigger('click')
    expect(layoutStore.setSidebarVisiblity).toHaveBeenCalledWith(true)
  })

  it('should change localStorage value for language', async () => {
    localStorage.setItem('translationLocale', '')
    const FdpgDropdownComponent = wrapper.findAllComponents(FdpgDropdown)[0]
    const props = FdpgDropdownComponent.props('items')
    props[0].action()
    expect(localStorage.getItem('translationLocale')).toBe('en')
    props[1].action()
    expect(localStorage.getItem('translationLocale')).toBe('de')
  })
})

describe.each([true, false])('FdpgHeader with mocked authentication', (isAuthenticated: boolean) => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: ReturnType<typeof mountComponent>
  beforeEach(() => {
    wrapper = mountComponent()
    authStore = vi.mocked(useAuthStore())
    authStore.isLoggedIn = isAuthenticated
  })

  it('should add items to dropdown', async () => {
    await flushPromises()
    const FdpgDropdownComponent = wrapper.findAllComponents(FdpgDropdown)
    if (!isAuthenticated) {
      expect(FdpgDropdownComponent[1].props().items.map((item: DropdownItem) => item.label)).toContain('header.login')
      expect(FdpgDropdownComponent[1].props().items.map((item: IDropdownIconItem) => item.iconClass)).toContain(
        'fa fa-arrow-right-to-bracket',
      )
    } else {
      expect(FdpgDropdownComponent[1].props().items.map((item: DropdownItem) => item.label)).toContain('header.logout')
      expect(FdpgDropdownComponent[1].props().items.map((item: IDropdownIconItem) => item.iconClass)).toContain(
        'fa fa-arrow-right-from-bracket',
      )
    }
  })
})
