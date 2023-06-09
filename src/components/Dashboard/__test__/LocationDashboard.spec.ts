import { useProposalStore } from '@/stores/proposal/proposal.store'
import { RouteName } from '@/types/route-name.enum'
import { createTestingPinia } from '@pinia/testing'
import type { VueWrapper } from '@vue/test-utils'
import { shallowMount } from '@vue/test-utils'
import LocationDashboard from '../LocationDashboard.vue'
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
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute),
}))

describe('LocationDashboard.vue', () => {
  let wrapper: VueWrapper<any>
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    wrapper = shallowMount(LocationDashboard, {
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
})
