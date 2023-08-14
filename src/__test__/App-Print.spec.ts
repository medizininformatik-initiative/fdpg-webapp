import AppPrint from '@/App-Print.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

vi.mock('@/stores/auth/auth.store', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    $oidc: {
      events: {
        addUserLoaded: vi.fn(),
      },
    },
  }),
}))
describe('App-Print.vue', () => {
  let wrapper: any
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    wrapper = mount(AppPrint, {
      global: {
        plugins: [],
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
})
