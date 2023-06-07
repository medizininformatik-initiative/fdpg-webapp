export enum RouteName {
  NoPermission = 'NoPermission',
  Dashboard = 'Dashboard',
  Pending = 'Pending',
  Archive = 'Archive',
  CreateProposal = 'CreateProposal',
  EditProposal = 'EditProposal',
  ProposalDetails = 'ProposalDetails',
  ReviewProposal = 'ReviewProposal',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  UserProfile = 'UserProfile',
}

export type FdpgDashboardRoutes = RouteName.Dashboard | RouteName.Pending | RouteName.Ongoing | RouteName.Completed
