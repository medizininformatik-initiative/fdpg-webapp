import App from '@/App.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { mount } from '@vue/test-utils'

vi.mock('@/stores/auth/auth.store', () => {
  const addUserLoadedMock = vi.fn().mockImplementation((callback: (user: any) => void) => {
    callback({ profile: {} })
  })

  return {
    useAuthStore: vi.fn().mockReturnValue({
      $oidc: {
        events: {
          addUserLoaded: addUserLoadedMock,
        },
      },
      setProfileUpdate: vi.fn(),
      setSelectedRole: vi.fn(),
    }),
  }
})
describe('App.vue', () => {
  let wrapper: any
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    vi.clearAllMocks()
    authStore = vi.mocked(useAuthStore())
    wrapper = mount(App, {
      global: {
        plugins: [],
        stubs: ['router-view'],
      },
    })
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('subscribes to oidc events', () => {
    expect(authStore.$oidc.events.addUserLoaded).toHaveBeenCalledTimes(1)
  })
})
