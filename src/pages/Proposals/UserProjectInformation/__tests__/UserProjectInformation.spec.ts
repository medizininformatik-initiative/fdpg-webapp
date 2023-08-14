import { mockProposal } from '@/mocks/proposal.mock'
import type { IUserProject } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount, shallowMount } from '@vue/test-utils'
import UserProjectInformation from '../UserProjectInformation.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

vi.mock('@/validations', () => ({}))

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  createTestingPinia()
  const modelValue: IUserProject = JSON.parse(JSON.stringify(mockProposal.userProject))
  return shallowMount(UserProjectInformation, {
    global: {
      plugins: [],
      stubs: [],
    },
    props: {
      platform: PlatformIdentifier.Mii,
      reviewMode: false,
      modelValue,
    },
  })
}

describe('UserProjectInformation.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>

  beforeEach(() => {
    wrapper = mountComponent()
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks for biosamples', () => {
    const biosampleComponent = wrapper.findComponent({ name: 'InformationOnBioSample' })
    expect(biosampleComponent.exists()).toBeTruthy()
    expect(biosampleComponent.props('modelValue')).toEqual(mockProposal.userProject.informationOnRequestedBioSamples)
  })
})
