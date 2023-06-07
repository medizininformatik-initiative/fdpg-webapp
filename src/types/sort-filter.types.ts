export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum Status {
  Draft = 'DRAFT',
  Outstanding = 'SUBMITTED__TASKS',
  Pending = 'ONGOING__CONTRACTING',
  Ongoing = 'ONGOING__RUNNING_PROJECT',
  Completed = 'COMPLETED__READY_TO_ARCHIVE',
  Archive = 'ARCHIVED',
  Requested = 'SUBMITTED__WAITING',
  // DRAFT = 'DRAFT',
  // SUBMITTED__WAITING = 'SUBMITTED__WAITING',
  // SUBMITTED__TASKS = 'SUBMITTED__TASKS',
  // SUBMITTED__REJECTED = 'SUBMITTED__REJECTED',
  // ONGOING__CONTRACTING = 'ONGOING__CONTRACTING',
  // ONGOING__EXPECT_DATA_DELIVERY = 'ONGOING__EXPECT_DATA_DELIVERY',
  // ONGOING__RUNNING_PROJECT = 'ONGOING__RUNNING_PROJECT',
  // ONGOING__FINISHED_PROJECT = 'ONGOING__FINISHED_PROJECT',
  // COMPLETED__WAITING_FOR_PUBLICATIONS = 'COMPLETED__WAITING_FOR_PUBLICATIONS',
  // COMPLETED__READY_TO_ARCHIVE = 'COMPLETED__READY_TO_ARCHIVE',
  // ARCHIVED = 'ARCHIVED'
}

export enum PanelQuery {
  // General
  Archived = 'ARCHIVED',

  // Researcher
  Draft = 'DRAFT',
  ResearcherPending = 'RESEARCHER_PENDING',
  ResearcherOngoing = 'RESEARCHER_ONGOING',
  ResearcherFinished = 'RESEARCHER_FINISHED',

  // DIZ
  DizPending = 'DIZ_PENDING',
  DizOngoing = 'DIZ_ONGOING',
  DizFinished = 'DIZ_FINISHED',
  DizRequested = 'DIZ_REQUESTED',

  // UAC
  UacPending = 'UAC_PENDING',
  UacOngoing = 'UAC_ONGOING',
  UacFinished = 'UAC_FINISHED',
  UacRequested = 'UAC_REQUESTED',

  // FDPG
  FdpgRequestedToCheck = 'FDPG_REQUESTED_TO_CHECK',
  FdpgRequestedInWork = 'FDPG_REQUESTED_IN_WORK',
  FdpgPendingToCheck = 'FDPG_PENDING_TO_CHECK',
  FdpgPendingInWork = 'FDPG_PENDING_IN_WORK',
  FdpgOngoingToCheck = 'FDPG_ONGOING_TO_CHECK',
  FdpgOngoingInWork = 'FDPG_ONGOING_IN_WORK',
  FdpgFinished = 'FDPG_FINISHED',
}

export interface ISortAndOrderBy<T> {
  order?: SortDirection
  sortBy?: keyof T & string
  panelQuery: PanelQuery
}
