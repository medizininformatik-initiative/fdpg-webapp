import { useAuthStore } from '@/stores/auth/auth.store'
import EditProfileDialog from '../EditProfileDialog.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockReturnValue('Test'),
    },
  },
}))

vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn().mockReturnValue({ params: { id: 'proposalId' } }),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}))

vi.mock('@/stores/proposal/proposal.store')

let authStore: ReturnType<typeof useAuthStore>

describe('EditProfileDialog.vue', () => {
  let wrapper: any
  beforeEach(() => {
    wrapper = mount(EditProfileDialog, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-row', 'el-col', 'el-button', 'el-form'],
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
