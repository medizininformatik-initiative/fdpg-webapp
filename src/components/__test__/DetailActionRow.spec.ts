import { useAuthStore } from '@/stores/auth/auth.store'
import DetailActionRow from '../DetailActionRow.vue'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import type { IDetailActionRow } from '@/types/detail-action-row.interface'

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

describe('DetailActionRow.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(DetailActionRow, {
      props: {
        buttons: [
          { isHidden: true, position: 'left' },
          { isHidden: false, position: 'right' },
        ] as IDetailActionRow[],
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
