import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { Role } from '@/types/oidc.types'
import { RouteName } from '@/types/route-name.enum'
import { PanelQuery } from '@/types/sort-filter.types'
import { createTestingPinia } from '@pinia/testing'
import { setActivePinia } from 'pinia'
import { computed } from 'vue'
import usePanels from '../use-panels'

describe('UsePanels', () => {
  let proposalStore: vi.MockedObject<ReturnType<typeof useProposalStore>>
  let authStore: vi.MockedObject<ReturnType<typeof useAuthStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    authStore = vi.mocked(useAuthStore())
    proposalStore.counts = proposalCountMock
  })

  it('should return the panels for the researcher', async () => {
    const routeName = computed(() => RouteName.Dashboard)
    authStore.singleKnownRole = Role.Researcher
    const { panels, proposalCount } = usePanels(routeName)

    expect(panels.value.length).toEqual(4)
    expect(proposalCount.value.total).toEqual(4 * 6)
    expect(proposalCount.value.critical).toEqual(4 * 1)
    expect(proposalCount.value.high).toEqual(4 * 2)
    expect(proposalCount.value.low).toEqual(4 * 3)
    expect(panels.value[0].query).toEqual(PanelQuery.Draft)
    expect(panels.value[1].query).toEqual(PanelQuery.ResearcherPending)
    expect(panels.value[2].query).toEqual(PanelQuery.ResearcherOngoing)
    expect(panels.value[3].query).toEqual(PanelQuery.ResearcherFinished)
  })

  it('should return the panels for the diz member', async () => {
    const routeName = computed(() => RouteName.Dashboard)
    authStore.singleKnownRole = Role.DizMember
    const { panels, proposalCount } = usePanels(routeName)

    expect(panels.value.length).toEqual(4)
    expect(proposalCount.value.total).toEqual(4 * 6)
    expect(proposalCount.value.critical).toEqual(4 * 1)
    expect(proposalCount.value.high).toEqual(4 * 2)
    expect(proposalCount.value.low).toEqual(4 * 3)
    expect(panels.value[0].query).toEqual(PanelQuery.DizRequested)
    expect(panels.value[1].query).toEqual(PanelQuery.DizPending)
    expect(panels.value[2].query).toEqual(PanelQuery.DizOngoing)
    expect(panels.value[3].query).toEqual(PanelQuery.DizFinished)
  })

  it('should return the panels for the uac member', async () => {
    const routeName = computed(() => RouteName.Dashboard)
    authStore.singleKnownRole = Role.UacMember
    const { panels, proposalCount } = usePanels(routeName)

    expect(panels.value.length).toEqual(4)
    expect(proposalCount.value.total).toEqual(4 * 6)
    expect(proposalCount.value.critical).toEqual(4 * 1)
    expect(proposalCount.value.high).toEqual(4 * 2)
    expect(proposalCount.value.low).toEqual(4 * 3)
    expect(panels.value[0].query).toEqual(PanelQuery.UacRequested)
    expect(panels.value[1].query).toEqual(PanelQuery.UacPending)
    expect(panels.value[2].query).toEqual(PanelQuery.UacOngoing)
    expect(panels.value[3].query).toEqual(PanelQuery.UacFinished)
  })

  describe('should return the panels for the fdpg member', () => {
    beforeEach(() => {
      authStore.singleKnownRole = Role.FdpgMember
    })
    it('on the dashboard page', async () => {
      const routeName = computed(() => RouteName.Dashboard)
      const { panels, proposalCount } = usePanels(routeName)

      expect(panels.value.length).toEqual(2)
      expect(proposalCount.value.total).toEqual(2 * 6)
      expect(proposalCount.value.critical).toEqual(2 * 1)
      expect(proposalCount.value.high).toEqual(2 * 2)
      expect(proposalCount.value.low).toEqual(2 * 3)

      expect(panels.value[0].query).toEqual(PanelQuery.FdpgRequestedToCheck)
      expect(panels.value[1].query).toEqual(PanelQuery.FdpgRequestedInWork)

      expect(panels.value[0].isTable).toBeFalsy()
      expect(panels.value[1].isTable).toBeTruthy()
    })

    it('on the Pending page', async () => {
      const routeName = computed(() => RouteName.Pending)
      const { panels, proposalCount } = usePanels(routeName)

      expect(panels.value.length).toEqual(2)
      expect(proposalCount.value.total).toEqual(2 * 6)
      expect(proposalCount.value.critical).toEqual(2 * 1)
      expect(proposalCount.value.high).toEqual(2 * 2)
      expect(proposalCount.value.low).toEqual(2 * 3)

      expect(panels.value[0].query).toEqual(PanelQuery.FdpgPendingToCheck)
      expect(panels.value[1].query).toEqual(PanelQuery.FdpgPendingInWork)

      expect(panels.value[0].isTable).toBeFalsy()
      expect(panels.value[1].isTable).toBeTruthy()
    })

    it('on the Ongoing page', async () => {
      const routeName = computed(() => RouteName.Ongoing)
      const { panels, proposalCount } = usePanels(routeName)

      expect(panels.value.length).toEqual(2)
      expect(proposalCount.value.total).toEqual(2 * 6)
      expect(proposalCount.value.critical).toEqual(2 * 1)
      expect(proposalCount.value.high).toEqual(2 * 2)
      expect(proposalCount.value.low).toEqual(2 * 3)

      expect(panels.value[0].query).toEqual(PanelQuery.FdpgOngoingToCheck)
      expect(panels.value[1].query).toEqual(PanelQuery.FdpgOngoingInWork)

      expect(panels.value[0].isTable).toBeFalsy()
      expect(panels.value[1].isTable).toBeTruthy()
    })

    it('on the Completed page', async () => {
      const routeName = computed(() => RouteName.Completed)
      const { panels, proposalCount } = usePanels(routeName)

      expect(panels.value.length).toEqual(1)
      expect(proposalCount.value.total).toEqual(6)
      expect(proposalCount.value.critical).toEqual(1)
      expect(proposalCount.value.high).toEqual(2)
      expect(proposalCount.value.low).toEqual(3)

      expect(panels.value[0].query).toEqual(PanelQuery.FdpgFinished)
      expect(panels.value[0].isTable).toBeTruthy()
    })
  })
})
