import { mockProposal } from '@/mocks/proposal.mock'
import type { IPropertyRights } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import PropertyRights from '../PropertyRights.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  const modelValue: IPropertyRights = JSON.parse(JSON.stringify(mockProposal.userProject.resourceAndRecontact))
  return mount(PropertyRights, {
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
    props: {
      reviewMode: false,
      modelValue,
    },
  })
}

describe('PropertyRights.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
