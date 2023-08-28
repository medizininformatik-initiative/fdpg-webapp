import { mockProposal } from '@/mocks/proposal.mock'
import type { IGeneralProjectInformation } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import GeneralProjectInformation from '../GeneralProjectInformation.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

const mountComponent = () => {
  const modelValue: IGeneralProjectInformation = JSON.parse(
    JSON.stringify(mockProposal.userProject.generalProjectInformation),
  )
  return mount(GeneralProjectInformation, {
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

describe('GeneralProjectInformation.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
