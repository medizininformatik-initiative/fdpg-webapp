import { Role } from '@/types/oidc.types'
import DashboardComponent from '../DashboardComponent.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import { useAuthStore } from '@/stores/auth/auth.store'

describe('DashboardComponent.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(DashboardComponent, {
      props: { modelValue: true },
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })
  beforeEach(() => {
    authStore = vi.mocked(useAuthStore())
  })
  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
  describe.each([Role.DizMember, Role.FdpgMember, Role.Researcher, Role.UacMember, Role.Admin])(
    'should load with %s role',
    (role: Role) => {
      beforeEach(() => {
        authStore.singleKnownRole = role
      })
      it('renders', () => {
        expect(wrapper).toBeTruthy()
      })
    },
  )
})
