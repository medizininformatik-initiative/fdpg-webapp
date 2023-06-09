import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import useLocationGrouping from '../use-location-grouping'
import { SORTED_ACTIVE_LOCATION_OPTIONS } from '@/constants'
import { i18n } from '@/plugins/i18n'
import { MiiLocation } from '@/types/location.enum'
import type { MockedObject } from 'vitest'

describe('UseLocationGrouping', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  const { t } = i18n.global

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
