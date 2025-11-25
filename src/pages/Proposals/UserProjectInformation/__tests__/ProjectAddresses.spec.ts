import { mockProposal } from '@/mocks/proposal.mock'
import type { IAddressees } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import ProjectAddresses from '../../Variables/ProjectAddresses.vue'
import { mockLocations, useMockLocationStore } from '@/stores/locations/__mocks__/location.store'

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

vi.mock('@/stores/locations/location.store', () => ({
  useLocationStore: vi.fn().mockImplementation(() => useMockLocationStore),
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
      allLocations: [...mockLocations],
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
