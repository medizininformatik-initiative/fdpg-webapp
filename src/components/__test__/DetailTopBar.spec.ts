import { useAuthStore } from '@/stores/auth/auth.store'
import DetailTopBar from '../DetailTopBar.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import type { IButtonConfig } from '@/types/button-config.interface'

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

let authStore: ReturnType<typeof useAuthStore>

describe('DetailTopBar.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(DetailTopBar, {
      props: {
        buttons: [{ isHidden: true }, { isHidden: false }] as IButtonConfig[],
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: ['el-button'],
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
