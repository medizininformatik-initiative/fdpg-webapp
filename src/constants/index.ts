import { CardType } from '@/types/component.types'
import { Countries } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import { ProjectFetchingType } from '@/types/proposal.types'
import { PanelQuery } from '@/types/sort-filter.types'

export const countryOptions = (t) =>
  Object.values(Countries).map((value) => ({
    label: t(`countries.${value}`),
    value,
  }))

const defaultColumns = [
  {
    prop: 'createdAt',
    header: 'dashboard.application',
    sortable: true,
    type: 'date',
  },
  {
    prop: 'projectAbbreviation',
    header: 'dashboard.projectAbbreviations',
    sortable: true,
    type: 'tag',
  },
  {
    prop: 'ownerName',
    header: 'general.applicant',
    sortable: true,
  },
]
export const tableColumns = {
  [PanelQuery.FdpgRequestedInWork]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],
  [PanelQuery.FdpgPendingInWork]: [
    ...defaultColumns,
    {
      prop: 'vote',
      header: 'dashboard.uacVote',
    },
    {
      prop: 'data',
      header: 'proposal.dataVolume',
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],
  [PanelQuery.FdpgOngoingInWork]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],

  [PanelQuery.FdpgFinished]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
  ],
}

const FdpgMemberQueries = {
  [CardType.Pending]: {
    [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgPendingToCheck,
    [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgPendingInWork,
  },
  [CardType.Requested]: {
    [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgRequestedToCheck,
    [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgRequestedInWork,
  },
  [CardType.Ongoing]: {
    [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgOngoingToCheck,
    [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgOngoingInWork,
  },
  [CardType.Completed]: PanelQuery.FdpgFinished,
}

export const PanelQueryObj = {
  [Role.FdpgMember]: FdpgMemberQueries,
  [Role.DataSourceMember]: FdpgMemberQueries,

  [Role.Researcher]: {
    [CardType.Draft]: PanelQuery.Draft,
    [CardType.Pending]: PanelQuery.ResearcherPending,
    [CardType.Ongoing]: PanelQuery.ResearcherOngoing,
    [CardType.Completed]: PanelQuery.ResearcherFinished,
  },

  [Role.UacMember]: {
    [CardType.Pending]: PanelQuery.UacPending,
    [CardType.Ongoing]: PanelQuery.UacOngoing,
    [CardType.Completed]: PanelQuery.UacFinished,
    [CardType.Requested]: PanelQuery.UacRequested,
  },

  [Role.DizMember]: {
    [CardType.Pending]: PanelQuery.DizPending,
    [CardType.Ongoing]: PanelQuery.DizOngoing,
    [CardType.Completed]: PanelQuery.DizFinished,
    [CardType.Requested]: PanelQuery.DizRequested,
  },

  [Role.DataManagementOffice]: {
    [CardType.Pending]: PanelQuery.DmsPending,
    [CardType.Ongoing]: PanelQuery.DmsApproved,
  },
}
