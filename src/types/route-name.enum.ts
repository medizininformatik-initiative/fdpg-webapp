export enum RouteName {
  NoPermission = 'NoPermission',
  Dashboard = 'Dashboard',
  Pending = 'Pending',
  Archive = 'Archive',
  Published = 'Published',
  CreateProposal = 'CreateProposal',
  EditProposal = 'EditProposal',
  ProposalDetails = 'ProposalDetails',
  ReviewProposal = 'ReviewProposal',
  Ongoing = 'Ongoing',
  Completed = 'Completed',
  UserProfile = 'UserProfile',
  RegisterProject = 'RegisterProject',
  RegisterNewProject = 'RegisterNewProject',
}

export type FdpgDashboardRoutes = RouteName.Dashboard | RouteName.Pending | RouteName.Ongoing | RouteName.Completed
