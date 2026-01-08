export enum RouteName {
  NoPermission = 'NoPermission',
  Dashboard = 'Dashboard',
  Pending = 'Pending',
  Archived = 'Archived',
  Published = 'Published',
  CreateProposal = 'CreateProposal',
  EditProposal = 'EditProposal',
  ProposalDetails = 'ProposalDetails',
  ReviewProposal = 'ReviewProposal',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  UserProfile = 'UserProfile',
  EditRegisteredProject = 'EditRegisteredProject',
  RegisterNewProject = 'RegisterNewProject',
  Locations = 'Locations',
  Overview = 'Overview',
}

export type FdpgDashboardRoutes =
  | RouteName.Overview
  | RouteName.Pending
  | RouteName.Ongoing
  | RouteName.Completed
  | RouteName.Dashboard
