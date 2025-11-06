import type { DeepPartial } from '@/types/deep-partial.type'
import type { IFdpgOidcProfile } from '@/types/oidc.types'
import {
  type IFdpgChecklist,
  type IOwner,
  type IProposal,
  type IRequestedData,
  ProposalTypeOfUse,
} from '@/types/proposal.types'
import type { IVersion } from '@/types/version.interface'
import { transformEmptyStringToUndefined } from '../empty-string.util'
import {
  transformApplicant,
  transformParticipants,
  transformProjectResponsible,
  transformProjectUser,
} from './participant-applicant-transform.util'
import { transformUserProject } from './transform-user-project.util'

const transformRequestedData = (requestedData?: DeepPartial<IRequestedData>): DeepPartial<IRequestedData> => {
  return {
    _id: requestedData?._id,
    isDone: requestedData?.isDone ?? false,
    patientInfo: transformEmptyStringToUndefined(requestedData?.patientInfo),
    dataInfo: transformEmptyStringToUndefined(requestedData?.dataInfo),
    desiredDataAmount: requestedData?.desiredDataAmount,
    desiredControlDataAmount: requestedData?.desiredControlDataAmount,
  }
}

const transformVersion = (version?: DeepPartial<IVersion>): DeepPartial<IVersion> => {
  return {
    mayor: version?.mayor ?? 0,
    minor: version?.minor ?? 1,
  }
}

const transformOwner = (owner?: DeepPartial<IOwner>): DeepPartial<IOwner> => {
  return {
    id: owner?.id,
    firstName: owner?.firstName,
    lastName: owner?.lastName,
    email: owner?.email,
    username: owner?.username,
    miiLocation: owner?.miiLocation,
    role: owner?.role,
  }
}

const transformChecklist = (
  usage: (ProposalTypeOfUse | undefined)[] | undefined,
  checklist: DeepPartial<IFdpgChecklist> | undefined,
): DeepPartial<IFdpgChecklist> => {
  if (!checklist) {
    return {
      isRegistrationLinkSent: false,
      checkListVerification: [],
      fdpgInternalCheckNotes: '',
      projectProperties: [],
    }
  }
  if (usage && usage.some((item) => item === ProposalTypeOfUse.Distributed)) {
    return checklist
  } else {
    return {
      ...checklist,
      checkListVerification: checklist.checkListVerification
        ? checklist.checkListVerification?.filter(
            (item) => item?.questionKey !== 'exampleScriptsAttached' && item?.questionKey !== 'distributedAnalysis',
          )
        : [],
    }
  }
}

export const transformForm = (
  form?: DeepPartial<IProposal>,
  transformToApi?: boolean,
  fdpgUser?: IFdpgOidcProfile,
): DeepPartial<IProposal> => {
  return {
    _id: form?._id,
    projectAbbreviation: form?.projectAbbreviation,
    participants: transformParticipants(form?.participants),
    applicant: transformApplicant(form?.applicant, fdpgUser),
    projectResponsible: transformProjectResponsible(form?.projectResponsible, transformToApi),
    projectUser: transformProjectUser(form?.projectUser),
    userProject: transformUserProject(form?.userProject, transformToApi),
    requestedData: transformRequestedData(form?.requestedData),
    uploads: form?.uploads,
    isLocked: form?.isLocked,
    status: form?.status,
    locationStatus: form?.locationStatus,
    createdAt: form?.createdAt,
    submittedAt: form?.submittedAt,
    updatedAt: form?.updatedAt,
    dueDateForStatus: form?.dueDateForStatus,
    history: form?.history ?? [],
    numberOfRequestedLocations: form?.numberOfRequestedLocations,
    numberOfApprovedLocations: form?.numberOfApprovedLocations,
    numberOfSignedLocations: form?.numberOfSignedLocations,
    contractAcceptedByResearcher: form?.contractAcceptedByResearcher,
    contractRejectedByResearcher: form?.contractRejectedByResearcher,
    contractRejectedByResearcherReason: form?.contractRejectedByResearcherReason,
    researcherSignedAt: form?.researcherSignedAt,
    owner: transformOwner(form?.owner),
    ownerId: form?.ownerId,
    ownerName: form?.ownerName,
    publications: form?.publications ?? [],
    fdpgChecklist: transformChecklist(form?.userProject?.typeOfUse?.usage, form?.fdpgChecklist),
    openFdpgTasks: form?.openFdpgTasks ?? [],
    isDoneOverview: form?.isDoneOverview ?? {},
    openDizChecks: form?.openDizChecks ?? [],
    dizApprovedLocations: form?.dizApprovedLocations ?? [],
    dizConditionApprovedLocations: form?.dizConditionApprovedLocations ?? [],
    uacApprovedLocations: form?.uacApprovedLocations ?? [],
    requestedButExcludedLocations: form?.requestedButExcludedLocations ?? [],
    signedContracts: form?.signedContracts ?? [],
    locationConditionDraft: form?.locationConditionDraft ?? [],
    conditionalApprovals: form?.conditionalApprovals ?? [],
    uacApprovals: form?.uacApprovals ?? [],
    totalPromisedDataAmount: form?.totalPromisedDataAmount,
    totalContractedDataAmount: form?.totalContractedDataAmount,
    declineReasons: form?.declineReasons ?? [],
    version: transformVersion(form?.version),
    fdpgCheckNotes: form?.fdpgCheckNotes,
    additionalLocationInformation: form?.additionalLocationInformation ?? [],
    isParticipatingScientist: form?.isParticipatingScientist,
    deadlines: form?.deadlines ?? {},
    signedContractsCount: form?.signedContractsCount,
    signedContractsPendingCount: form?.signedContractsPendingCount,
    uacApprovedLocationsCount: form?.uacApprovedLocationsCount,
    requestedButExcludedLocationsCount: form?.requestedButExcludedLocationsCount,
    conditionalApprovalsCount: form?.conditionalApprovalsCount,
    uacApprovalsCount: form?.uacApprovalsCount,
    selectedDataSources: form?.selectedDataSources ?? [],
    dizDetails: form?.dizDetails ?? [],
    dataDelivery: form?.dataDelivery,
  }
}
