import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import FdpgHeaderRole from '../FdpgHeaderRole.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, flushPromises } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import FdpgDropdown from '../FdpgDropdown.vue'

import type { DropdownItem, IDropdownIconItem } from '@/types/dropdown.types'
import { Role } from '@/types/oidc.types'
vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))
vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

const mountComponent = () => {
  return mount(FdpgHeaderRole, {
    props: {},
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
  })
}

describe('FdpgHeaderRole.vue', () => {
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
})

describe('FdpgHeaderRole with mocked roles', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: ReturnType<typeof mountComponent>
  beforeEach(() => {
    wrapper = mountComponent()
    authStore = vi.mocked(useAuthStore())
    authStore.roles = [Role.FdpgMember, Role.Researcher, Role.DizMember]
  })

  it('should add items to dropdown', async () => {
    await flushPromises()
    const FdpgDropdownComponent = wrapper.findAllComponents(FdpgDropdown)
    expect(FdpgDropdownComponent.length).toBe(1)
  })
})

describe('FdpgHeaderRole with mocked roles', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: ReturnType<typeof mountComponent>
  beforeEach(() => {
    wrapper = mountComponent()
    authStore = vi.mocked(useAuthStore())
    authStore.roles = [Role.FdpgMember]
  })

  it('should add items to dropdown', async () => {
    await flushPromises()
    const FdpgDropdownComponent = wrapper.findAllComponents(FdpgDropdown)
    expect(FdpgDropdownComponent.length).toBe(0)
  })
})
