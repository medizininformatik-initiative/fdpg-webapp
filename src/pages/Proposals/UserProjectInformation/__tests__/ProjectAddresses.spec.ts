import { mockProposal } from '@/mocks/proposal.mock'
import type { IAddressees } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import ProjectAddresses from '../../Variables/ProjectAddresses.vue'

vi.mock('vue-i18n', () => ({
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
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
}))

const mountComponent = () => {
  const modelValue: IAddressees = JSON.parse(JSON.stringify(mockProposal.userProject.addressees))
  return mount(ProjectAddresses, {
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

describe('ProjectAddresses.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
