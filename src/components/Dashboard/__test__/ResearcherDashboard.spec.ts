import { useProposalStore } from '@/stores/proposal/proposal.store'
import { RouteName } from '@/types/route-name.enum'
import { createTestingPinia } from '@pinia/testing'
import type { VueWrapper } from '@vue/test-utils'
import { shallowMount } from '@vue/test-utils'
import ResearcherDashboard from '../ResearcherDashboard.vue'
import FdpgSortSelect from '@/components/FdpgSortSelect.vue'
import type { MockedObject } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockReturnValue('Test'),
    locale: {
      value: 'de-DE',
    },
  })),
}))

const mockRoute = RouteName.Dashboard
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  createRouter: vi.fn().mockImplementation(() => ({ beforeEach: vi.fn() })),
  createWebHistory: vi.fn(),
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => ({
    push: mockPush,
  })),
}))

describe('ResearcherDashboard.vue', () => {
  let wrapper: VueWrapper<any>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    wrapper = shallowMount(ResearcherDashboard, {
      global: {
        plugins: [createTestingPinia()],
        stubs: [],
      },
    })
  })

  beforeEach(() => {
    proposalStore = vi.mocked(useProposalStore())
  })

  it('renders', () => {
    expect(wrapper).toBeTruthy()
  })

  it('calls the proposalStore to handle the sort order change', () => {
    const selectElement = wrapper.findComponent(FdpgSortSelect)
    selectElement.vm.$emit('sortOrderChange')
    expect(proposalStore.toggleSortDirection).toHaveBeenCalledTimes(1)
  })

  it('calls the proposalStore to handle the sort change', () => {
    const selectElement = wrapper.findComponent(FdpgSortSelect)
    selectElement.vm.$emit('sortChange', 'test')
    expect(proposalStore.setSortField).toHaveBeenLastCalledWith('test')
  })

  it('calls the router to go to the create page', () => {
    wrapper.vm.createProposal()
    expect(mockPush).toBeCalledWith({ name: RouteName.CreateProposal })
  })

  it('navigates to the feasibility portal', () => {
    wrapper.vm.checkFeasibility()
    expect(window.open).toBeCalledWith(import.meta.env.VITE_FEASIBILITY_HOST)
  })
})
