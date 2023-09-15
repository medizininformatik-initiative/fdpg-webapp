import DetailComponent from '../Proposals/Details/DetailComponent.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount, type VueWrapper } from '@vue/test-utils'
import { useAuthStore } from '@/stores/auth/auth.store'
import type { MockedObject } from 'vitest'
import { Role } from '@/types/oidc.types'

describe('DetailComponent.vue', () => {
  let authStore: MockedObject<ReturnType<typeof useAuthStore>>
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mount(DetailComponent, {
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

  describe.each([Role.DizMember, Role.FdpgMember, Role.Researcher, Role.UacMember])(
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
