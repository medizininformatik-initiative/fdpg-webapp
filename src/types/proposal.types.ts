import type { CardType } from '@/types/component.types'
import type { Countries, MiiLocation } from '@/types/location.enum'
import type { Department } from './department.enum'
import type { Role } from './oidc.types'
import type { PanelQuery } from './sort-filter.types'
import type { UploadType } from './upload.types'
import type { IVersion } from './version.interface'
import type { PublicationType } from './publication-type.enum'
import type { Deadlines } from './due-date.enum'
import type { DifeTypeOfUse } from './dife-type-of-use.enum'
import type { PlatformIdentifier } from './platform-identifier.enum'
import type { PseudonymizationInfoOptions } from './PseudonymizationInfo.enum'

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

export enum ParticipantRole {
  ParticipatingScientist = 'PARTICIPATING_SCIENTIST',
  Researcher = 'RESEARCHER',
  ResponsibleScientist = 'RESPONSIBLE_SCIENTIST',
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
  participantRole: string
  username: string
  addedByFdpg?: boolean
  participantId?: string // This is used to identify the researcher in the proposal
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

export interface IParticipantRole extends WithIdAndIsDone {
  role: ParticipantRole
}

export interface IParticipant extends WithIdAndIsDone {
  researcher: IResearcher
  institute: IInstitute
  participantCategory: IParticipantCategory
  participantRole: IParticipantRole
  addedByFdpg?: boolean
}

export interface IApplicant {
  researcher: IResearcher
  institute: IInstitute
  participantCategory: IParticipantCategory
}

export interface IProjectResponsible {
  institute: IInstitute
  participantCategory: IParticipantCategory
  participantRole: IParticipantRole
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
  desiredStartTimeType: string | undefined
  keywords: string[]
}

export interface IProjectDetails extends WithIdAndIsDone {
  simpleProjectDescription: string
  department: Department[]
  scientificBackground: string
  hypothesisAndQuestionProjectGoals: string
  materialAndMethods: string
  executiveSummaryUac: string
  literature: string
  biometric: string
}

export interface IEthicVote extends WithIdAndIsDone {
  isDone: boolean
  isExisting: boolean
  ethicsCommittee: string
  ethicsVoteNumber: string
  voteFromDate: string
}

export interface IResourceAndRecontact extends WithIdAndIsDone {
  hasEnoughResources: boolean
  isRecontactingIntended: boolean
  suppSurveyReContacting: boolean
  suppSurveyReContactingText: string
  reContactIncidental: boolean
  reContactIncidentalText: string
  urgentIncidentalReContacting: boolean
  urgentIncidentalReContactingText: string
}

export interface IDifeSelectionOfCases {
  selectedCases: DifeSelectionOfCasesEntries[]
  otherExplanation?: string
}
export interface ISelectionOfCases extends WithIdAndIsDone {
  difeSelectionOfCases: IDifeSelectionOfCases
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

export enum DIFEProposalTypeOfUse {
  DATA_SHIELD = 'DATA_SHIELD',
  EXTERNAL_SR = 'EXTERNAL_SR',
  INTERNAL_SR = 'INTERNAL_SR',
}

export enum DifeSelectionOfCasesEntries {
  EPIC_Potsdam_Full_Cohort = 'EPIC_Potsdam_Full_Cohort',
  EPIC_Potsdam_Sub_Cohort = 'EPIC_Potsdam_Sub_Cohort',
  EPIC_Potsdam_Case_Cohort = 'EPIC_Potsdam_Case_Cohort',
  EPIC_Potsdam_InterAct_Physical_Activity = 'EPIC_Potsdam_InterAct_Physical_Activity',
  Validation_Study_EPIC_Potsdam_Baseline = 'Validation_Study_EPIC_Potsdam_Baseline',
  EPIC_Long_term_study_BMBF_2010_2012 = 'EPIC_Long_term_study_BMBF_2010_2012',
  EPIC_Long_term_study_BMBF_2013 = 'EPIC_Long_term_study_BMBF_2013',
  EPIC_DZD_2014 = 'EPIC_DZD_2014',
  Other = 'Other',
}
export enum BiosampleType {
  FLUID = 'FLUID',
  TISSUE = 'TISSUE',
  DRIVATIVE = 'DRIVATIVE',
}

export enum BiosampleCode {
  SNOMED = 'SNOMED',
  SPREC = 'SPREC',
}
export interface IBiosample {
  _id?: string
  type?: BiosampleType
  typeDetails?: string
  count?: string
  parameter?: string
  requirements?: string
  optionalBiosample?: boolean
  sampleCode?: BiosampleCode[]
  [BiosampleCode.SNOMED]?: string
  [BiosampleCode.SPREC]?: string
  method?: string
  externalLabTransfer?: boolean
  externalLabTransferDetails?: string
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
  targetFormat: string
  targetFormatOther: string
  difeUsage: DIFEProposalTypeOfUse[]
  pseudonymizationInfo: PseudonymizationInfoOptions[]
  pseudonymizationInfoTexts: Record<PseudonymizationInfoOptions, string>
}

export interface IInformationOnRequestedBioSamples extends WithIdAndIsDone {
  noSampleRequired: boolean
  laboratoryResources: string
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
  variableSelection?: IVariableSelectionData
  selectionOfCases: ISelectionOfCases
  cohorts: ICohort
}

export interface IRequestedData extends WithIdAndIsDone {
  patientInfo: string
  dataInfo: string
  desiredDataAmount?: number
  desiredControlDataAmount?: number
}

export interface IVariableSelectionData extends WithIdAndIsDone {
  DIFE?: IDifeVariableSelectionData
}

export interface IDifeVariableSelectionData {
  typeOfUse?: DifeTypeOfUse
  typeOfUseExplanation?: string
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
  FdpgLocationVoteReverted = 'FDPG_LOCATION_VOTE_REVERTED',
  ParticipantAdded = 'PARTICIPANT_ADDED',
  ParticipantRemoved = 'PARTICIPANT_REMOVED',
  ParticipantUpdated = 'PARTICIPANT_UPDATED',
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
  data?: Record<string, string | number>
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

export interface IChecklistItem {
  isAnswered: boolean
  _id: string
  questionKey: string
  comment: string | null
  isMultiple: boolean
  options: { optionValue: string }[]
  answer: string[]
  sublist?: IChecklistItem[]
}

export interface IFdpgChecklist {
  isRegistrationLinkSent: boolean
  checkListVerification: IChecklistItem[]
  fdpgInternalCheckNotes: string | null
  projectProperties: IChecklistItem[]
}

export type FdpgChecklistItemUpdateResponse =
  | IChecklistItem
  | { _id: 'isRegistrationLinkSent'; isRegistrationLinkSent: boolean }
  | { _id: 'fdpgInternalCheckNotes'; fdpgInternalCheckNotes: string | null }

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
  uploadId?: string
  conditionReasoning?: string
  _id: string
  createdAt: Date
  reviewedAt?: string
  signedAt?: string
  isLate?: boolean
}

export interface IUacApproval {
  location: MiiLocation
  dataAmount: number
  isContractSigned?: boolean
  _id: string
  createdAt: Date
  signedAt?: string
  isLate?: boolean
}
export interface IAdditionalLocationProposalInformation {
  location: MiiLocation
  legalBasis: boolean
  locationPublicationName?: string
}

export type IEditAdditionalLocationProposalInformation = Omit<IAdditionalLocationProposalInformation, 'location'>

export interface IDizDetails {
  _id?: string
  location: MiiLocation
  localProjectIdentifier?: string
  documentationLinks: string
}

export enum LocationState {
  IsDizCheck = 'DIZ_CHECK',
  DizApproved = 'DIZ_APPROVED',
  DizConditionCheck = 'DIZ_CONDITION_CHECK',
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
  selectedDataSources: PlatformIdentifier[]

  // LOCATION Tasks --->
  // The following arrays should be used as a flow.
  // One location should only be in one state at the same time
  openDizChecks: MiiLocation[]
  dizApprovedLocations: MiiLocation[]
  openDizConditionChecks: MiiLocation[]
  uacApprovedLocations: MiiLocation[]
  uacApprovedLocationsCount: number
  dizConditionApprovedLocations: MiiLocation[]
  requestedButExcludedLocations: MiiLocation[]
  requestedButExcludedLocationsCount: number
  signedContracts: MiiLocation[]
  signedContractsCount: number
  signedContractsPendingCount: number

  // LOCATION Tasks <----
  additionalLocationInformation: IAdditionalLocationProposalInformation[]
  dizDetails: IDizDetails[]

  // Conditional and UAC approval are stored additionally to the "flow-arrays" and are persistent
  locationConditionDraft: IConditionalApproval[]
  conditionalApprovals: IConditionalApproval[]
  conditionalApprovalsCount: number
  uacApprovals: IUacApproval[]
  uacApprovalsCount: number
  totalPromisedDataAmount?: number
  totalContractedDataAmount?: number
  declineReasons: IDeclineReason[]
  fdpgCheckNotes?: string
  isParticipatingScientist?: boolean
  deadlines: Deadlines
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
  selectedDataSources: PlatformIdentifier[]
}

export interface IDeclineReason {
  type: DeclineType
  reason?: string
  location: MiiLocation
  createdAt: Date
  isLate?: boolean
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

export type IDataSource = {
  title: string
  description: string
  externalLink: string
}
export type IDataSourceDto = {
  [key in PlatformIdentifier]: IDataSource
}

export interface ISelectedCohort {
  _id?: string
  feasibilityQueryId?: number
  label?: string
  comment?: string
  uploadId?: string
  isManualUpload?: boolean
  numberOfPatients?: number
}
export interface ICohort extends WithIdAndIsDone {
  selectedCohorts: ISelectedCohort[]
  details?: string
}
