import { mockProposal } from '@/mocks/proposal.mock'
import { useFeasibilityStore } from '@/stores/feasibility.store'
import type { IFeasibility } from '@/types/proposal.types'
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'
import type { MockedObject } from 'vitest'
import ProjectFeasibility from '../ProjectFeasibility.vue'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

const mountComponent = (withPinia = true) => {
  const modelValue: IFeasibility = JSON.parse(JSON.stringify(mockProposal.userProject.feasibility))
  const plugins: any[] = withPinia ? [createTestingPinia()] : []
  return mount(ProjectFeasibility, {
    global: {
      plugins,
      stubs: [],
    },
    props: {
      reviewMode: false,
      modelValue,
    },
  })
}

describe('ProjectFeasibility.vue', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let mockedFeasibilityStore: MockedObject<ReturnType<typeof useFeasibilityStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mountComponent()
    mockedFeasibilityStore = vi.mocked(useFeasibilityStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('should call the feasibility store on mount', () => {
    expect(mockedFeasibilityStore.getAll).toHaveBeenCalledTimes(1)
  })

  it('should provide the correct options to the select component', async () => {
    const queries = [
      {
        id: 1,
        label: 'query.label1',
        createdAt: '',
      },
      {
        id: 2,
        label: 'query.label2',
        createdAt: '',
      },
    ]
    mockedFeasibilityStore.feasibilityQueries = queries
    await wrapper.setProps({ reviewMode: false })

    const selectComponent = wrapper.findComponent({ name: 'FdpgSelect' })
    const selectComponentProps = selectComponent.props('options')

    const expected = queries.map((query) => ({ label: query.label, value: query.id }))
    expect(selectComponentProps).toEqual(expected)
  })

  it('should provide the correct noDataText to the select component', async () => {
    const selectComponent = wrapper.findComponent({ name: 'FdpgSelect' })
    const selectComponentProps = selectComponent.props('noDataText')
    expect(selectComponentProps).toEqual('proposal.noFeasibilityQueriesSaved')
  })
})

describe('ProjectFeasibility.vue with failing mount call', () => {
  let wrapper: ReturnType<typeof mountComponent>
  let mockedFeasibilityStore: MockedObject<ReturnType<typeof useFeasibilityStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    createTestingPinia()
    mockedFeasibilityStore = vi.mocked(useFeasibilityStore())
    mockedFeasibilityStore.getAll.mockRejectedValue(new Error('Error'))
    wrapper = mountComponent(false)
  })

  it('renders and calls the service', async () => {
    expect(wrapper).toBeTruthy()
    expect(mockedFeasibilityStore.getAll).toHaveBeenCalledTimes(1)
  })

  it('should provide the correct noDataText to the select component', async () => {
    const selectComponent = wrapper.findComponent({ name: 'FdpgSelect' })
    const selectComponentProps = selectComponent.props('noDataText')
    expect(selectComponentProps).toEqual('proposal.noFeasibilityQueriesWhenError')
  })
})
