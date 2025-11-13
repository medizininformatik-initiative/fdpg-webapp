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
  { type: CardType.Requested, header: 'dashboard.requested', query: PanelQuery.DizRequested, hasClickAction: true },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.DizPending, hasClickAction: true },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.DizOngoing, hasClickAction: true },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.DizFinished, hasClickAction: true },
  {
    type: CardType.ComingUp,
    header: 'dashboard.comingUp',
    isTable: true,
    query: PanelQuery.DizComingUp,
    hasClickAction: false,
  },
]

const UAC_PANELS: PanelType[] = [
  { type: CardType.Requested, header: 'dashboard.requested', query: PanelQuery.UacRequested, hasClickAction: true },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.UacPending, hasClickAction: true },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.UacOngoing, hasClickAction: true },
  { type: CardType.Completed, header: 'dashboard.completed', query: PanelQuery.UacFinished, hasClickAction: true },
]

const RESEARCHER_PANELS: PanelType[] = [
  { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.Draft, hasClickAction: true },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.ResearcherPending, hasClickAction: true },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.ResearcherOngoing, hasClickAction: true },
  {
    type: CardType.Completed,
    header: 'dashboard.completed',
    query: PanelQuery.ResearcherFinished,
    hasClickAction: true,
  },
]

const PUBLISHED_PANELS: PanelType[] = [
  { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.PublishedDraft, hasClickAction: true },
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.PublishedPending, hasClickAction: true },
  {
    type: CardType.Completed,
    header: 'dashboard.completed',
    query: PanelQuery.PublishedCompleted,
    hasClickAction: true,
  },
]

const FDPG_PUBLISHED_PANELS: PanelType[] = [
  { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.FdpgPublishedDraft, hasClickAction: true },
  {
    type: CardType.Requested,
    header: 'general.requested',
    query: PanelQuery.FdpgPublishedRequested,
    hasClickAction: true,
  },
  {
    type: CardType.Pending,
    header: 'general.readyForPublication',
    query: PanelQuery.FdpgPublishedReady,
    hasClickAction: true,
  },
  {
    type: CardType.Completed,
    header: 'general.published',
    query: PanelQuery.FdpgPublishedPublished,
    hasClickAction: true,
  },
]

const FDPG_PANELS: Record<FdpgDashboardRoutes, PanelType[]> = {
  [RouteName.Dashboard]: [
    {
      type: CardType.Requested,
      header: 'dashboard.forTesting',
      query: PanelQuery.FdpgRequestedToCheck,
      hasClickAction: true,
    },
    {
      type: CardType.Ongoing,
      header: 'dashboard.inProcess',
      isTable: true,
      query: PanelQuery.FdpgRequestedInWork,
      hasClickAction: true,
    },
  ],
  [RouteName.Pending]: [
    {
      type: CardType.Pending,
      header: 'dashboard.forTesting',
      query: PanelQuery.FdpgPendingToCheck,
      hasClickAction: true,
    },
    {
      type: CardType.Pending,
      header: 'dashboard.inProcess',
      isTable: true,
      query: PanelQuery.FdpgPendingInWork,
      hasClickAction: true,
    },
  ],
  [RouteName.Ongoing]: [
    {
      type: CardType.Ongoing,
      header: 'dashboard.forTesting',
      query: PanelQuery.FdpgOngoingToCheck,
      hasClickAction: true,
    },
    {
      type: CardType.Ongoing,
      header: 'dashboard.inProcess',
      isTable: true,
      query: PanelQuery.FdpgOngoingInWork,
      hasClickAction: true,
    },
  ],
  [RouteName.Completed]: [
    {
      type: CardType.Completed,
      header: 'dashboard.inProcess',
      isTable: true,
      query: PanelQuery.FdpgFinished,
      hasClickAction: true,
    },
  ],
}

const DMS_PANELS: PanelType[] = [
  { type: CardType.Pending, header: 'general.pending', query: PanelQuery.DmsPending, hasClickAction: true },
  { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.DmsApproved, hasClickAction: true },
]

const PANEL_MAP: Record<Role, PanelType[] | Record<FdpgDashboardRoutes, PanelType[]>> = {
  [Role.Researcher]: RESEARCHER_PANELS,
  [Role.RegisteringMember]: PUBLISHED_PANELS,
  [Role.FdpgMember]: FDPG_PANELS,
  [Role.DataSourceMember]: FDPG_PANELS,
  [Role.DizMember]: DIZ_PANELS,
  [Role.UacMember]: UAC_PANELS,
  [Role.Admin]: [],
  [Role.DataManagementOffice]: DMS_PANELS,
}

export default (routeName: ComputedRef<RouteRecordName>) => {
  const proposalStore = useProposalStore()
  const authStore = useAuthStore()
  const rolesWithBasicPanels = [
    Role.Researcher,
    Role.RegisteringMember,
    Role.DizMember,
    Role.UacMember,
    Role.DataManagementOffice,
  ]

  const hasRegisteringMemberRole = computed(() => {
    return authStore.roles.includes(Role.RegisteringMember)
  })

  const panels = computed<PanelType[]>(() => {
    if (routeName.value === RouteName.Archive) {
      return []
    } else if (routeName.value === RouteName.Published) {
      if (authStore.hasFdpgLevelPermissions()) {
        return FDPG_PUBLISHED_PANELS
      } else if (hasRegisteringMemberRole.value) {
        return PUBLISHED_PANELS
      } else {
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
