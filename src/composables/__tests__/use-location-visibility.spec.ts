import { MII_LOCATIONS } from '@/constants'
import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { CommentType } from '@/types/comment.interface'
import { MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { computed } from 'vue'
import type { IVisibilityMessage } from '../use-location-visibility'
import useLocationVisibility from '../use-location-visibility'
import type { MockedObject } from 'vitest'

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn().mockImplementation(() => ({
    t: vi.fn().mockImplementation((key: string, obj?: any) => key + (obj ? JSON.stringify(obj) : '')),
    locale: {
      value: 'de-DE',
    },
  })),
}))

describe('UseLocationVisibility', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should not be visible', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC],
          owner: { location: [MiiLocation.MHH], role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_MESSAGE_TO_OWNER, false)
    expect(visibility.value).toBe(undefined)
  })

  it('should be visible for all', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC, MiiLocation.VirtualAll],
          owner: { location: [MiiLocation.MHH], role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, false)
    expect(visibility.value).toBe('proposal.commentVisibleForAll')
  })

  it('should be visible for no location', async () => {
    const message = computed(
      () =>
        ({
          locations: [],
          owner: { location: [MiiLocation.MHH], role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, false)
    expect(visibility.value).toBe('proposal.commentVisibleForNoLocation')
  })

  it('should be visible for some location', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC, MiiLocation.KUM, MiiLocation.UKAU],
          owner: { location: [MiiLocation.MHH], role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, false)
    expect(visibility.value).toBe(
      'proposal.commentVisibleForCount' + JSON.stringify({ count: message.value.locations?.length }),
    )
  })

  it('should be visible for this location', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC],
          owner: { role: Role.Admin, miiLocation: MiiLocation.KC },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, false)
    expect(visibility.value).toBe('proposal.commentVisibleForThisLocation')
  })

  it('should be visible for specific location', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC],
          owner: { role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, true)
    const location = MII_LOCATIONS[message.value.locations[0]]?.display
    expect(visibility.value).toBe('proposal.commentVisibleForOneOtherLocation' + JSON.stringify({ location }))
  })

  it('should be visible for one location', async () => {
    const message = computed(
      () =>
        ({
          locations: [MiiLocation.KC],
          owner: { role: Role.Admin },
        } as unknown as IVisibilityMessage),
    )
    const { visibility } = useLocationVisibility(message, CommentType.PROPOSAL_TASK, false)
    expect(visibility.value).toBe('proposal.commentVisibleForOneLocation')
  })
})
