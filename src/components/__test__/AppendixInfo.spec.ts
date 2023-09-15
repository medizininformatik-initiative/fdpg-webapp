import { useAuthStore } from '@/stores/auth/auth.store'
import AppendixInfo from '../AppendixInfo.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'


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

let authStore: ReturnType<typeof useAuthStore>

describe('AppendixInfo.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(AppendixInfo, {
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-col', 'el-row', 'el-progress'],
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
