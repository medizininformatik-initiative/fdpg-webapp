import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import type { PanelType } from '@/types/proposal.types'
import type { FdpgDashboardRoutes } from '@/types/route-name.enum'
import { RouteName } from '@/types/route-name.enum'
import { PanelQuery } from '@/types/sort-filter.types'
import type { ComputedRef } from 'vue'
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

// Published page panels for researchers, UAC, DIZ, and registering members
const PUBLISHED_PANELS: PanelType[] = [
  { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.PublishedDraft },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.PublishedPending },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.PublishedCompleted },
]

// FDPG Published page panels
const FDPG_PUBLISHED_PANELS: PanelType[] = [
  { type: CardType.Requested, header: 'general.requested', query: PanelQuery.FdpgPublishedRequested },
  { type: CardType.Pending, header: 'general.readyForPublication', query: PanelQuery.FdpgPublishedReady },
  { type: CardType.Completed, header: 'general.published', query: PanelQuery.FdpgPublishedPublished },
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
  // [RouteName.Published]:[
  //   {type:CardType.Requested,}
  // ]
}

const PANEL_MAP: Record<Role, PanelType[] | Record<FdpgDashboardRoutes, PanelType[]>> = {
  [Role.Researcher]: RESEARCHER_PANELS,
  [Role.RegisteringMember]: PUBLISHED_PANELS,
  [Role.FdpgMember]: FDPG_PANELS,
  [Role.DataSourceMember]: FDPG_PANELS,
  [Role.DizMember]: DIZ_PANELS,
  [Role.UacMember]: UAC_PANELS,
  [Role.Admin]: [],
}

export default (routeName: ComputedRef<RouteRecordName>) => {
  const proposalStore = useProposalStore()
  const authStore = useAuthStore()
  const rolesWithBasicPanels = [Role.Researcher, Role.RegisteringMember, Role.DizMember, Role.UacMember]

  // Check if user has RegisteringMember role among their assigned roles
  const hasRegisteringMemberRole = computed(() => {
    return authStore.roles.includes(Role.RegisteringMember)
  })

  const panels = computed<PanelType[]>(() => {
    if (routeName.value === RouteName.Archive) {
      return []
    } else if (routeName.value === RouteName.Published) {
      // Different logic for FDPG members vs other roles
      if (authStore.hasFdpgLevelPermissions()) {
        // FDPG members see FDPG-specific published page
        return FDPG_PUBLISHED_PANELS
      } else if (hasRegisteringMemberRole.value) {
        // RegisteringMember, researchers, UAC, DIZ see the same published panels
        return PUBLISHED_PANELS
      } else {
        // Users without RegisteringMember role cannot see published page
        return []
      }
    } else if (authStore.hasFdpgLevelPermissions()) {
      const fdpgPanels = PANEL_MAP[Role.FdpgMember] as Record<FdpgDashboardRoutes, PanelType[]>
      return fdpgPanels[routeName.value as FdpgDashboardRoutes] ?? []
    } else if (
      authStore.singleKnownRole &&
      rolesWithBasicPanels.includes(authStore.singleKnownRole) &&
      routeName.value === RouteName.Dashboard
    ) {
      return PANEL_MAP[authStore.singleKnownRole] as PanelType[]
    } else {
      return []
    }
  })

  const proposalCount = computed(() =>
    panels.value.reduce(
      (acc, { query }) => {
        Object.keys(proposalStore.counts[query] || {}).forEach((key) => {
          const typedKey = key as keyof typeof acc
          const count = proposalStore.counts[query]?.[typedKey] ?? 0
          acc[typedKey] += count
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
