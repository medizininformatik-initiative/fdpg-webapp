import type { DeepPartial } from '@/types/deep-partial.type'
import { MiiLocation } from '@/types/location.enum'
import type {
  IAddressees,
  IBiosample,
  IEthicVote,
  IFeasibility,
  IGeneralProjectInformation,
  IInformationOnRequestedBioSamples,
  IPlannedPublication,
  IProjectDetails,
  IPropertyRights,
  IPublication,
  IResourceAndRecontact,
  ITypeOfUse,
  IUserProject,
} from '@/types/proposal.types'
import { ProposalTypeOfUse } from '@/types/proposal.types'
import { hasNoContent, transformEmptyStringToUndefined } from '../empty-string.util'
const NEW_ID = 'NEW_ID'

const transformProjectDetails = (projectDetails?: DeepPartial<IProjectDetails>): DeepPartial<IProjectDetails> => {
  return {
    _id: projectDetails?._id,
    isDone: projectDetails?.isDone ?? false,
    simpleProjectDescription: transformEmptyStringToUndefined(projectDetails?.simpleProjectDescription),
    department: projectDetails?.department ?? [],
    scientificBackground: transformEmptyStringToUndefined(projectDetails?.scientificBackground),
    hypothesisAndQuestionProjectGoals: transformEmptyStringToUndefined(
      projectDetails?.hypothesisAndQuestionProjectGoals,
    ),
    materialAndMethods: transformEmptyStringToUndefined(projectDetails?.materialAndMethods),
  }
}

export const transformEthicVote = (ethicVote?: DeepPartial<IEthicVote>): DeepPartial<IEthicVote> => {
  return {
    _id: ethicVote?._id,
    isDone: ethicVote?.isDone ?? false,
    isExisting: ethicVote?.isExisting ?? true,
    ethicsCommittee: transformEmptyStringToUndefined(ethicVote?.ethicsCommittee),
    ethicsVoteNumber: transformEmptyStringToUndefined(ethicVote?.ethicsVoteNumber),
    voteFromDate: transformEmptyStringToUndefined(ethicVote?.voteFromDate),
    admitReputationOfAttachment: ethicVote?.admitReputationOfAttachment,
  }
}

const transformFeasibility = (feasibility?: DeepPartial<IFeasibility>): DeepPartial<IFeasibility> => {
  return {
    _id: feasibility?._id,
    isDone: feasibility?.isDone ?? false,
    id: feasibility?.id,
    details: transformEmptyStringToUndefined(feasibility?.details),
  }
}

const transformGeneralProjectInformation = (
  generalProjectInformation?: DeepPartial<IGeneralProjectInformation>,
): DeepPartial<IGeneralProjectInformation> => {
  return {
    _id: generalProjectInformation?._id,
    isDone: generalProjectInformation?.isDone ?? false,
    projectTitle: transformEmptyStringToUndefined(generalProjectInformation?.projectTitle),
    desiredStartTime: transformEmptyStringToUndefined(generalProjectInformation?.desiredStartTime),
    projectDuration: generalProjectInformation?.projectDuration,
    projectFunding: transformEmptyStringToUndefined(generalProjectInformation?.projectFunding),
    fundingReferenceNumber: transformEmptyStringToUndefined(generalProjectInformation?.fundingReferenceNumber),
  }
}

const transformResourceAndRecontact = (
  resourceAndRecontact?: DeepPartial<IResourceAndRecontact>,
): DeepPartial<IResourceAndRecontact> => {
  return {
    _id: resourceAndRecontact?._id,
    isDone: resourceAndRecontact?.isDone ?? false,
    hasEnoughResources: resourceAndRecontact?.hasEnoughResources ?? false,
    isRecontactingIntended: resourceAndRecontact?.isRecontactingIntended ?? false,
  }
}
const transformPropertyRights = (propertyRights?: DeepPartial<IPropertyRights>): DeepPartial<IPropertyRights> => {
  return {
    _id: propertyRights?._id,
    isDone: propertyRights?.isDone ?? false,
    options: transformEmptyStringToUndefined(propertyRights?.options),
  }
}
const transformPlannedPublication = (
  plannedPublication?: DeepPartial<IPlannedPublication>,
  transformToApi?: boolean,
): DeepPartial<IPlannedPublication> => {
  return {
    _id: plannedPublication?._id,
    isDone: plannedPublication?.isDone ?? false,
    noPublicationPlanned: plannedPublication?.noPublicationPlanned ?? false,
    publications: transformPublications(
      plannedPublication?.publications,
      transformToApi,
      plannedPublication?.noPublicationPlanned,
    ),
  }
}

export const mapPublication = (publication?: Partial<IPublication>): Partial<IPublication> => ({
  _id: publication?._id ?? NEW_ID,
  type: publication?.type,
  description: transformEmptyStringToUndefined(publication?.description),
  authors: transformEmptyStringToUndefined(publication?.authors),
})

const transformPublications = (
  publications?: DeepPartial<IPublication[]>,
  transformToApi?: boolean,
  noPublicationPlanned?: boolean,
): DeepPartial<IPublication[]> | undefined => {
  if (publications) {
    const filteredPublications = publications
      .map((publication) => mapPublication(publication))
      .filter((publication) => !hasNoContent(publication))

    const isEmpty = filteredPublications.length <= 0
    if (!isEmpty) {
      return filteredPublications
    }
  }

  // If it's empty we don't need to create it in the api, but we like to have an empty version for the ui
  // But if noPublicationPlanned value is true we need to prevent publications.length as a truthy value to prevent showing it in review page
  if (transformToApi) {
    return undefined
  } else if (noPublicationPlanned) {
    return []
  } else {
    return [mapPublication()]
  }
}

const transformAddressees = (addressees?: DeepPartial<IAddressees>): DeepPartial<IAddressees> => {
  return {
    _id: addressees?._id,
    isDone: addressees?.isDone ?? false,
    desiredLocations: addressees?.desiredLocations ?? (addressees?._id ? [] : [MiiLocation.VirtualAll]),
  }
}
const transformTypeOfUse = (typeOfUse?: DeepPartial<ITypeOfUse>): DeepPartial<ITypeOfUse> => {
  return {
    _id: typeOfUse?._id,
    isDone: typeOfUse?.isDone ?? false,
    usage: typeOfUse?.usage ?? [],
    dataPrivacyExtra: transformEmptyStringToUndefined(typeOfUse?.dataPrivacyExtra),
  }
}

const transformInformationOnRequestedBioSamples = (
  informationOnRequestedBioSamples?: DeepPartial<IInformationOnRequestedBioSamples>,
  typeOfUse?: DeepPartial<ITypeOfUse>,
  transformToApi?: boolean,
): DeepPartial<IInformationOnRequestedBioSamples> | undefined => {
  return typeOfUse?.usage?.includes(ProposalTypeOfUse.Biosample)
    ? {
        _id: informationOnRequestedBioSamples?._id,
        isDone: informationOnRequestedBioSamples?.isDone ?? false,
        biosamples: transformBiosamples(informationOnRequestedBioSamples?.biosamples, transformToApi),
      }
    : undefined
}

export const mapBiosample = (biosample?: Partial<IBiosample>): Partial<IBiosample> => {
  return {
    _id: biosample?._id ?? NEW_ID,
    type: transformEmptyStringToUndefined(biosample?.type),
    parameter: transformEmptyStringToUndefined(biosample?.parameter),
    laboratoryResources: transformEmptyStringToUndefined(biosample?.laboratoryResources),
    requirements: transformEmptyStringToUndefined(biosample?.requirements),
    count: transformEmptyStringToUndefined(biosample?.count),
  }
}
export const transformBiosamples = (
  biosamples?: DeepPartial<IBiosample[]>,
  transformToApi?: boolean,
): DeepPartial<IBiosample[]> | undefined => {
  if (biosamples) {
    const filteredBiosamples = biosamples
      .map((biosample) => mapBiosample(biosample))
      .filter((biosample) => !hasNoContent(biosample))

    const isEmpty = filteredBiosamples.length <= 0
    if (!isEmpty) {
      return filteredBiosamples
    }
  }

  // If it's empty we don't need to create it in the api, but we like to have an empty version for the ui
  return transformToApi ? undefined : [mapBiosample()]
}

export const transformUserProject = (
  userProject?: DeepPartial<IUserProject>,
  transformToApi?: boolean,
): DeepPartial<IUserProject> => {
  return {
    generalProjectInformation: transformGeneralProjectInformation(userProject?.generalProjectInformation),
    feasibility: transformFeasibility(userProject?.feasibility),
    projectDetails: transformProjectDetails(userProject?.projectDetails),
    ethicVote: transformEthicVote(userProject?.ethicVote),
    resourceAndRecontact: transformResourceAndRecontact(userProject?.resourceAndRecontact),
    propertyRights: transformPropertyRights(userProject?.propertyRights),
    plannedPublication: transformPlannedPublication(userProject?.plannedPublication, transformToApi),
    addressees: transformAddressees(userProject?.addressees),
    typeOfUse: transformTypeOfUse(userProject?.typeOfUse),
    informationOnRequestedBioSamples: transformInformationOnRequestedBioSamples(
      userProject?.informationOnRequestedBioSamples,
      userProject?.typeOfUse,
      transformToApi,
    ),
  }
}
