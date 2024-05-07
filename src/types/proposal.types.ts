import type { CardType } from '@/types/component.types'
import type { Countries, MiiLocation } from '@/types/location.enum'
import type { Department } from './department.enum'
import type { Role } from './oidc.types'
import type { PanelQuery } from './sort-filter.types'
import type { UploadType } from './upload.types'
import type { IVersion } from './version.interface'
import type { PublicationType } from './publication-type.enum'

export interface WithIdAndIsDone {
  isDone?: boolean
  _id?: string
}

export type SortableFields = keyof Pick<
  IProposal,
  'submittedAt' | 'ownerName' | 'dueDateForStatus' | 'projectAbbreviation'
>

export enum ProposalStatus {
  Draft = 'DRAFT',
  Rejected = 'REJECTED',
  Archived = 'ARCHIVED',
  Rework = 'REWORK',
  FdpgCheck = 'FDPG_CHECK',
  LocationCheck = 'LOCATION_CHECK',
  Contracting = 'CONTRACTING',
  ExpectDataDelivery = 'EXPECT_DATA_DELIVERY',
  DataResearch = 'DATA_RESEARCH',
  DataCorrupt = 'DATA_CORRUPT',
  FinishedProject = 'FINISHED_PROJECT',
  ReadyToArchive = 'READY_TO_ARCHIVE',
}

export enum ParticipantType {
  ProjectLeader = 'PROJECT_LEADER',
  AdditionalProjectLeader = 'ADDITIONAL_PROJECT_LEADER',
  DataReceiver = 'DATA_RECEIVER',
  BiosampleReceiver = 'BIOSAMPLE_RECEIVER',
  DataAndBiosampleReceiver = 'DATA_AND_BIOSAMPLE_RECEIVER',
}

export enum ProjectUserType {
  ApplicantAsPrivatePerson = 'APPLICANT_AS_PRIVATE_PERSON',
  OrganizationOfProjectResponsible = 'ORGANIZATION_OF_PROJECT_RESPONSIBLE',
}

export interface IResearcher extends WithIdAndIsDone {
  title: string
  firstName: string
  lastName: string
  affiliation: string
  email: string
}

export interface IResearcherIdentity extends IResearcher {
  isExisting: boolean
  isEmailVerified: boolean
  isRegistrationComplete: boolean
  participantType: ParticipantType
  username: string
}

export interface IInstitute extends WithIdAndIsDone {
  name?: string
  streetAddress?: string
  houseNumber?: string
  postalCode?: string
  city?: string
  country?: Countries
  email?: string
  miiLocation?: MiiLocation
}

export interface IParticipantCategory extends WithIdAndIsDone {
  category: ParticipantType
}

export interface IParticipant extends WithIdAndIsDone {
  researcher: IResearcher
  institute: IInstitute
  participantCategory: IParticipantCategory
}

export interface IApplicant {
  researcher: IResearcher
  institute: IInstitute
  participantCategory: IParticipantCategory
}

export interface IProjectResponsible {
  institute: IInstitute
  participantCategory: IParticipantCategory
  researcher: IResearcher
  projectResponsibility: IProjectResponsibility
}

export interface IProjectResponsibility extends WithIdAndIsDone {
  applicantIsProjectResponsible: boolean
}

export interface IProjectUser extends WithIdAndIsDone {
  projectUserType: ProjectUserType
}

export interface IGeneralProjectInformation extends WithIdAndIsDone {
  projectTitle: string
  desiredStartTime: string
  projectDuration: number | undefined
  projectFunding: string
  fundingReferenceNumber: string
}

export interface IProjectDetails extends WithIdAndIsDone {
  simpleProjectDescription: string
  department: Department[]
  scientificBackground: string
  hypothesisAndQuestionProjectGoals: string
  materialAndMethods: string
}

export interface IEthicVote extends WithIdAndIsDone {
  isDone: boolean
  isExisting: boolean
  ethicsCommittee: string
  ethicsVoteNumber: string
  voteFromDate: string
  admitReputationOfAttachment: boolean
}

export interface IResourceAndRecontact extends WithIdAndIsDone {
  hasEnoughResources: boolean
  isRecontactingIntended: boolean
}

export interface IAppendix {
  name: string
  size: number
  path: string
}

export interface IPublication {
  _id?: string
  type: PublicationType
  description: string
  authors: string
}

export enum ProposalTypeOfUse {
  Distributed = 'DISTRIBUTED',
  Centralized = 'CENTRALIZED',
  Biosample = 'BIOSAMPLE',
}

export interface IBiosample {
  _id?: string
  type?: string
  count?: string
  parameter?: string
  laboratoryResources?: string
  requirements?: string
}

export interface IFeasibility extends WithIdAndIsDone {
  id?: number
  details?: string
}

export interface IPropertyRights extends WithIdAndIsDone {
  options: string
}

export interface IPlannedPublication extends WithIdAndIsDone {
  noPublicationPlanned: boolean
  publications: IPublication[]
}

export interface IAddressees extends WithIdAndIsDone {
  desiredLocations: MiiLocation[]
}

export interface ITypeOfUse extends WithIdAndIsDone {
  usage: ProposalTypeOfUse[]
  dataPrivacyExtra?: string
}

export interface IInformationOnRequestedBioSamples extends WithIdAndIsDone {
  biosamples: IBiosample[]
}

export interface IUserProject {
  generalProjectInformation: IGeneralProjectInformation
  feasibility: IFeasibility
  projectDetails: IProjectDetails
  ethicVote: IEthicVote
  resourceAndRecontact: IResourceAndRecontact
  propertyRights: IPropertyRights
  plannedPublication: IPlannedPublication
  addressees: IAddressees
  typeOfUse: ITypeOfUse
  informationOnRequestedBioSamples: IInformationOnRequestedBioSamples
}

export interface IRequestedData extends WithIdAndIsDone {
  patientInfo: string
  dataInfo: string
  desiredDataAmount?: number
}

export enum ProjectHistoryType {
  ProposalCreated = 'PROPOSAL_CREATING',
  ProposalFdpgCheck = 'PROPOSAL_FDPG_CHECK',
  ProposalRework = 'PROPOSAL_REWORK',
  ProposalRejected = 'PROPOSAL_REJECT',
  ProposalLocationCheck = 'PROPOSAL_LOCATION_CHECK',
  ProposalContracting = 'PROPOSAL_CONTRACTING',
  ProposalDataDelivery = 'PROPOSAL_DATA_DELIVERY',
  ProposalDataCorrupt = 'PROPOSAL_DATA_CORRUPT',
  ProposalDataResearch = 'PROPOSAL_DATA_RESEARCH',
  ProposalFinished = 'PROPOSAL_FINISHED',
  ProposalReadyToArchive = 'PROPOSAL_READY_TO_ARCHIVE',
  ProposalArchived = 'PROPOSAL_ARCHIVED',

  DizVoteAccept = 'DIZ_VOTE_ACCEPT',
  DizVoteDecline = 'DIZ_VOTE_DECLINE',
  UacVoteAccept = 'UAC_VOTE_ACCEPT',
  UacVoteConditionalAccept = 'UAC_VOTE_CONDITIONAL_ACCEPT',
  UacVoteDecline = 'UAC_VOTE_DECLINE',
  UacConditionAccept = 'UAC_CONDITION_ACCEPT',
  UacConditionDecline = 'UAC_CONDITION_DECLINE',
  FdpgApprovedLocationRemoved = 'FDPG_APPROVED_LOCATION_REMOVED',
  ContractResearcherApproved = 'CONTRACT_RESEARCHER_APPROVED',
  ContractResearcherRejected = 'CONTRACT_RESEARCHER_REJECTED',
  ContractUacApproved = 'CONTRACT_UAC_APPROVED',
  ContractUacRejected = 'CONTRACT_UAC_REJECTED',
  ContractSystemRejected = 'CONTRACT_SYSTEM_REJECTED',
  FdpgRevertedLocationVote = 'FDPG_REVERTED_LOCATION_VOTE',
}

export enum UploadFileType {
  Docx = 'DOCX',
  Pdf = 'PDF',
}

export enum ProjectStatusType {
  neutral = 'neutral',
  info = 'info',
  success = 'success',
  warning = 'warning',
}

export enum ProjectFetchingType {
  TO_CHECK = 'TO_CHECK',
  IN_WORK = 'IN_WORK',
}

export interface IUpload {
  fileName: string
  fileSize: number
  type: UploadType
  createdAt: string
  _id: string
}

export interface PanelType {
  type: CardType
  query: PanelQuery
  header: string
  isTable?: boolean
}

export interface IProposalHistory {
  createdAt: string
  type: ProjectHistoryType
  proposalVersion: { minor: number; major: number }
  location?: MiiLocation
}
interface IPublicationBase {
  title: string
  doi: string
  link: string
}
export interface IPublicationGet extends IPublicationBase {
  updatedAt: string
  createdAt: string
  _id: string
}

export interface IPublicationCreateAndUpdate extends IPublicationBase {}

interface IReportBase {
  content: string
  title: string
}
export interface IReportFile extends IUpload {
  downloadUrl: string
  mimetype: string
}
export interface IReportGet extends IReportBase {
  _id?: string
  createdAt?: string
  updatedAt?: string
  uploads: IReportFile[]
}

export interface IReportCreate extends IReportBase {
  files: File[]
}

export interface IReportUpdate extends IReportCreate {
  keepUploads: string[]
}
export interface IFdpgChecklist {
  isRegistrationLinkSent?: boolean
  isUnique?: boolean
  isAttachmentsChecked?: boolean
  isChecked?: boolean
}

export interface IsDoneDetail {
  path: string
  value: boolean
  _id: string
}
export interface IIsDoneOverview {
  fieldCount: number
  isDoneCount: number
  fields: IsDoneDetail[]
}

export interface IConditionalApproval {
  location: MiiLocation
  isAccepted: boolean
  isContractSigned?: boolean
  dataAmount: number
  uploadId: string
  _id: string
  createdAt: string
  reviewedAt?: string
  signedAt?: string
}

export interface IUacApproval {
  location: MiiLocation
  dataAmount: number
  isContractSigned?: boolean
  _id: string
  createdAt: string
  signedAt?: string
}

export enum LocationState {
  IsDizCheck = 'DIZ_CHECK',
  DizApproved = 'DIZ_APPROVED',
  UacApproved = 'UAC_APPROVED',
  SignedContract = 'SIGNED_CONTRACT',
  SignedContractAndContractingDone = 'SIGNED_CONTRACT_AND_CONTRACTING_DONE',
  RequestedButExcluded = 'REQUESTED_BUT_EXCLUDED',
  NotRequested = 'NOT_REQUESTED',
  ConditionalApprovalDeclined = 'CONDITIONAL_APPROVAL_DECLINED',
  ResearcherRejectedContract = 'RESEARCHER_REJECTED_CONTRACT',
  ResearcherAcceptedContract = 'RESEARCHER_ACCEPTED_CONTRACT',
  ConditionalApprovalAccepted = 'CONDITIONAL_APPROVAL_ACCEPTED',
  ConditionalApprovalPending = 'CONDITIONAL_APPROVAL_PENDING',
}
export interface IOwner {
  id: string
  firstName: string
  lastName: string
  email: string
  username?: string
  miiLocation?: MiiLocation
  role?: Role
}

// !!
// When adding something here:
// Make sure to modify the transformForm method
// src/utils/form-transform/index.ts
// !!
export interface IProposal {
  _id?: string
  participants: IParticipant[]
  applicant: IApplicant
  projectResponsible: IProjectResponsible
  projectUser: IProjectUser
  projectAbbreviation: string
  userProject: IUserProject
  requestedData: IRequestedData
  isLocked: boolean
  status?: ProposalStatus
  locationStatus?: LocationState
  createdAt?: string
  submittedAt?: string
  updatedAt?: string
  dueDateForStatus?: string
  history?: IProposalHistory[]
  numberOfRequestedLocations?: number
  numberOfApprovedLocations?: number
  numberOfSignedLocations?: number
  version?: IVersion
  owner: IOwner
  ownerId?: string
  ownerName?: string
  publications: IPublicationGet[]
  reports: IReportGet[]
  uploads?: IUpload[]
  contractAcceptedByResearcher: boolean
  contractRejectedByResearcher: boolean
  contractRejectedByResearcherReason?: string
  researcherSignedAt: string
  fdpgChecklist?: IFdpgChecklist
  isDoneOverview?: IIsDoneOverview
  openFdpgTasks: IOpenFdpgTask[]
  // LOCATION Tasks --->
  // The following arrays should be used as a flow.
  // One location should only be in one state at the same time
  openDizChecks: MiiLocation[]
  dizApprovedLocations: MiiLocation[]
  uacApprovedLocations: MiiLocation[]
  requestedButExcludedLocations: MiiLocation[]
  signedContracts: MiiLocation[]
  // LOCATION Tasks <----

  // Conditional and UAC approval are stored additionally to the "flow-arrays" and are persistent
  conditionalApprovals: IConditionalApproval[]
  uacApprovals: IUacApproval[]
  totalPromisedDataAmount?: number
  totalContractedDataAmount?: number
  declineReasons: IDeclineReason[]
  fdpgCheckNotes?: string
}

export enum FdpgTaskType {
  // Multiple tasks of this type are possible to be open for one proposal:
  Comment = 'COMMENT',
  ConditionApproval = 'CONDITION_APPROVAL',

  // Only once:
  UacApprovalComplete = 'UAC_APPROVAL_COMPLETE',
  DataAmountReached = 'DATA_AMOUNT_REACHED',
  ContractComplete = 'CONTRACT_COMPLETE',
  DueDateReached = 'DUE_DATE_REACHED',
}

interface IOpenFdpgTask {
  _id: string
  type: FdpgTaskType
}

export type IProposalMarkConditionAcceptedReturnDto = Pick<
  IProposal,
  | 'uploads'
  | 'history'
  | 'numberOfApprovedLocations'
  | 'totalPromisedDataAmount'
  | 'openDizChecks'
  | 'dizApprovedLocations'
  | 'uacApprovedLocations'
  | 'requestedButExcludedLocations'
  | 'conditionalApprovals'
  | 'uacApprovals'
>

export interface IProposalDetail {
  _id: string
  createdAt: string
  updatedAt: string
  submittedAt: string
  dueDateForStatus?: string
  isLocked: boolean
  //Frontend only
  computedDueDate?: number

  projectAbbreviation: string
  projectTitle: string
  ownerId: string
  ownerName: string

  status: ProposalStatus
  requestedLocationsCount: number
  openDizChecksCount: number
  dizApprovedCount: number
  uacApprovedCount: number
  approvedLocationsCount: number
  signedContractsCount: number
  requestedButExcludedCount: number
  desiredDataAmount: number
  totalPromisedDataAmount: number
  totalContractedDataAmount: number
  openFdpgTasks: IOpenFdpgTask[]
  locationState: LocationState
  contractAcceptedByResearcher: boolean
  contractRejectedByResearcher: boolean
}

export interface IDeclineReason {
  type: DeclineType
  reason?: string
  location: MiiLocation
  createdAt: string
}

export enum DeclineType {
  DizApprove = 'DIZ_APPROVE',
  UacApprove = 'UAC_APPROVE',
  LocationSign = 'LOCATION_SIGN',
}

export interface IProposalCount {
  total?: number
  critical?: number
  high?: number
  medium?: number
  low?: number
}
