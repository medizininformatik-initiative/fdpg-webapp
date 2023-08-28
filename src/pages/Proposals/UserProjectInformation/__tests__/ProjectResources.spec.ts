import { mockProposal } from '@/mocks/proposal.mock'
import type { IResourceAndRecontact } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import ProjectResources from '../ProjectResources.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  const modelValue: IResourceAndRecontact = JSON.parse(JSON.stringify(mockProposal.userProject.resourceAndRecontact))
  return mount(ProjectResources, {
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

describe('ProjectResources.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
