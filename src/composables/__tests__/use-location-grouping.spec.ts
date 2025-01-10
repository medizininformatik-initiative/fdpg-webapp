import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useLocationGrouping from '../use-location-grouping'
import { i18n } from '@/plugins/i18n'
import { SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { MiiLocation } from '@/types/location.enum'
import type { MockedObject } from 'vitest'

vi.mock('@/plugins/i18n', () => ({
  i18n: {
    global: {
      t: vi.fn().mockImplementation((entry) => entry),
    },
  },
  createI18n: vi.fn(),
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

    const { t } = i18n.global

    expect(groupOptions).toBeDefined()
    expect(groupOptions).toEqual([
      {
        label: undefined,
        options: [
          {
            label: t('proposal.commentVisibleForAll'),
            value: MiiLocation.VirtualAll,
          },
        ],
      },
      {
        label: t('general.locations'),
        options: SORTED_ACTIVE_LOCATION_OPTIONS,
      },
    ])
  })
})
