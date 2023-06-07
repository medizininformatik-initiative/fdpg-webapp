import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import type { PanelType } from '@/types/proposal.types'
import type { FdpgDashboardRoutes} from '@/types/route-name.enum';
import { RouteName } from '@/types/route-name.enum'
import { PanelQuery } from '@/types/sort-filter.types'
import type { ComputedRef } from 'vue';
import { computed } from 'vue'
import type { RouteRecordName } from 'vue-router'

const DIZ_PANELS: PanelType[] = [
  { type: CardType.Requested, header: 'dashboard.requested', query: PanelQuery.DizRequested },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.DizPending },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.DizOngoing },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.DizFinished },
]

const UAC_PANELS: PanelType[] = [
  { type: CardType.Requested, header: 'dashboard.requested', query: PanelQuery.UacRequested },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.UacPending },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.UacOngoing },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.UacFinished },
]

const RESEARCHER_PANELS: PanelType[] = [
  { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.Draft },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.ResearcherPending },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.ResearcherOngoing },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.ResearcherFinished },
]

const FDPG_PANELS: Record<FdpgDashboardRoutes, PanelType[]> = {
  [RouteName.Dashboard]: [
    { type: CardType.Requested, header: 'dashboard.forTesting', query: PanelQuery.FdpgRequestedToCheck },
    { type: CardType.Ongoing, header: 'dashboard.ongoing', isTable: true, query: PanelQuery.FdpgRequestedInWork },
  ],
  [RouteName.Pending]: [
    { type: CardType.Pending, header: 'dashboard.forTesting', query: PanelQuery.FdpgPendingToCheck },
    { type: CardType.Pending, header: 'dashboard.ongoing', isTable: true, query: PanelQuery.FdpgPendingInWork },
  ],
  [RouteName.Ongoing]: [
    { type: CardType.Ongoing, header: 'dashboard.forTesting', query: PanelQuery.FdpgOngoingToCheck },
    { type: CardType.Ongoing, header: 'dashboard.ongoing', isTable: true, query: PanelQuery.FdpgOngoingInWork },
  ],
  [RouteName.Completed]: [
    { type: CardType.Completed, header: 'dashboard.ongoing', isTable: true, query: PanelQuery.FdpgFinished },
  ],
}

const PANEL_MAP = {
  [Role.Researcher]: RESEARCHER_PANELS,
  [Role.FdpgMember]: FDPG_PANELS,
  [Role.DizMember]: DIZ_PANELS,
  [Role.UacMember]: UAC_PANELS,
}

export default (routeName: ComputedRef<RouteRecordName>) => {
  const proposalStore = useProposalStore()
  const authStore = useAuthStore()
  const rolesWithBasicPanels = [Role.Researcher, Role.DizMember, Role.UacMember]

  const panels = computed<PanelType[]>(() => {
    if (routeName.value === RouteName.Archive) {
      return []
    } else if (authStore.singleKnownRole === Role.FdpgMember) {
      return PANEL_MAP[authStore.singleKnownRole][routeName.value] ?? []
    } else if (
      authStore.singleKnownRole &&
      rolesWithBasicPanels.includes(authStore.singleKnownRole) &&
      routeName.value === RouteName.Dashboard
    ) {
      return PANEL_MAP[authStore.singleKnownRole]
    } else {
      return []
    }
  })

  const proposalCount = computed(() =>
    panels.value.reduce(
      (acc, { query }) => {
        Object.keys(proposalStore.counts[query] || {}).forEach((key) => {
          acc[key] += proposalStore.counts[query]?.[key] ?? 0
        })
        return acc
      },
      {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      },
    ),
  )

  return {
    panels,
    proposalCount,
  }
}
