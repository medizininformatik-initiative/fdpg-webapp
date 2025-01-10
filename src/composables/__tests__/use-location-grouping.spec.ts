import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useLocationGrouping from '../use-location-grouping'
import { SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { MiiLocation } from '@/types/location.enum'
import type { MockedObject } from 'vitest'

vi.mock('vue-i18n', () => ({
  createI18n: vi.fn(),
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string) => key),
  })),
}))

describe('UseLocationGrouping', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should have a default value if it does not have any entries', async () => {
    const { groupOptions } = useLocationGrouping()
    expect(groupOptions).toBeDefined()
    expect(groupOptions).toEqual([
      {
        label: undefined,
        options: [
          {
            label: 'proposal.commentVisibleForAll',
            value: MiiLocation.VirtualAll,
          },
        ],
      },
      {
        label: 'general.locations',
        options: SORTED_ACTIVE_LOCATION_OPTIONS,
      },
    ])
  })
})
