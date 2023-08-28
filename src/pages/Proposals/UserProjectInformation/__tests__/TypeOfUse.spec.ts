import { mockProposal } from '@/mocks/proposal.mock'
import type { ITypeOfUse } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import TypeOfUse from '../TypeOfUse.vue'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { MockedObject } from 'vitest'
import { useConfigStore } from '@/stores/config/config.store'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = () => {
  const modelValue: ITypeOfUse = JSON.parse(JSON.stringify(mockProposal.userProject.typeOfUse))
  return mount(TypeOfUse, {
    global: {
      plugins: [createTestingPinia()],
      stubs: [],
    },
    props: {
      reviewMode: false,
      modelValue,
      platform: PlatformIdentifier.Mii,
    },
  })
}

describe('TypeOfUse.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let configStore: MockedObject<ReturnType<typeof useConfigStore>>

  beforeEach(() => {
    wrapper = mountComponent()
    configStore = vi.mocked(useConfigStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })
})
