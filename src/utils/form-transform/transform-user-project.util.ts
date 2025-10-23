import type { DeepPartial } from '@/types/deep-partial.type'
import type {
  IAddressees,
  IBiosample,
  ICohort,
  IEthicVote,
  IFeasibility,
  IGeneralProjectInformation,
  IInformationOnRequestedBioSamples,
  IPlannedPublication,
  IProjectDetails,
  IPropertyRights,
  IPublication,
  IResourceAndRecontact,
  ISelectedCohort,
  ISelectionOfCases,
  ITypeOfUse,
  IUserProject,
  IVariableSelectionData,
} from '@/types/proposal.types'
import { ProposalTypeOfUse } from '@/types/proposal.types'
import { hasNoContent, transformEmptyStringToUndefined } from '../empty-string.util'
import { PseudonymizationInfoOptions } from '@/types/PseudonymizationInfo.enum'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { BiosampleCode } from '@/types/proposal.types'
const NEW_ID = 'NEW_ID'

const transformProjectDetails = (projectDetails?: DeepPartial<IProjectDetails>): DeepPartial<IProjectDetails> => {
  return {
    _id: projectDetails?._id,
    isDone: projectDetails?.isDone ?? false,
    simpleProjectDescription: transformEmptyStringToUndefined(projectDetails?.simpleProjectDescription),
    executiveSummaryUac: transformEmptyStringToUndefined(projectDetails?.executiveSummaryUac),
    department: projectDetails?.department ?? [],
    scientificBackground: transformEmptyStringToUndefined(projectDetails?.scientificBackground),
    hypothesisAndQuestionProjectGoals: transformEmptyStringToUndefined(
      projectDetails?.hypothesisAndQuestionProjectGoals,
    ),
    materialAndMethods: transformEmptyStringToUndefined(projectDetails?.materialAndMethods),
    literature: transformEmptyStringToUndefined(projectDetails?.literature),
    biometric: transformEmptyStringToUndefined(projectDetails?.biometric),
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
    desiredStartTimeType: generalProjectInformation?.desiredStartTimeType,
    projectDuration: generalProjectInformation?.projectDuration,
    projectFunding: transformEmptyStringToUndefined(generalProjectInformation?.projectFunding),
    fundingReferenceNumber: transformEmptyStringToUndefined(generalProjectInformation?.fundingReferenceNumber),
    keywords: generalProjectInformation?.keywords ?? [],
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
    suppSurveyReContacting: resourceAndRecontact?.suppSurveyReContacting ?? false,
    suppSurveyReContactingText: transformEmptyStringToUndefined(resourceAndRecontact?.suppSurveyReContactingText),
    reContactIncidental: resourceAndRecontact?.reContactIncidental ?? false,
    reContactIncidentalText: transformEmptyStringToUndefined(resourceAndRecontact?.reContactIncidentalText),
    urgentIncidentalReContacting: resourceAndRecontact?.urgentIncidentalReContacting ?? false,
    urgentIncidentalReContactingText: transformEmptyStringToUndefined(
      resourceAndRecontact?.urgentIncidentalReContactingText,
    ),
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
    desiredLocations: addressees?.desiredLocations ?? [],
  }
}
const transformTypeOfUse = (typeOfUse?: DeepPartial<ITypeOfUse>): DeepPartial<ITypeOfUse> => {
  return {
    _id: typeOfUse?._id,
    isDone: typeOfUse?.isDone ?? false,
    usage: typeOfUse?.usage ?? [],
    dataPrivacyExtra: transformEmptyStringToUndefined(typeOfUse?.dataPrivacyExtra),
    targetFormat: transformEmptyStringToUndefined(typeOfUse?.targetFormat),
    targetFormatOther: transformEmptyStringToUndefined(typeOfUse?.targetFormatOther),
    difeUsage: typeOfUse?.difeUsage ?? [],
    pseudonymizationInfo: typeOfUse?.pseudonymizationInfo ?? [],
    pseudonymizationInfoTexts: {
      [PseudonymizationInfoOptions.enableRecordLinkage]: transformEmptyStringToUndefined(
        typeOfUse?.pseudonymizationInfoTexts?.enableRecordLinkage,
      ),
      [PseudonymizationInfoOptions.siteGroupingEnabled]: transformEmptyStringToUndefined(
        typeOfUse?.pseudonymizationInfoTexts?.siteGroupingEnabled,
      ),
      [PseudonymizationInfoOptions.namedSiteVariable]: transformEmptyStringToUndefined(
        typeOfUse?.pseudonymizationInfoTexts?.namedSiteVariable,
      ),
    },
  }
}

const transformInformationOnRequestedBioSamples = (
  noSampleRequired?: boolean,
  laboratoryResources?: string,
  informationOnRequestedBioSamples?: DeepPartial<IInformationOnRequestedBioSamples>,
  typeOfUse?: DeepPartial<ITypeOfUse>,
  transformToApi?: boolean,
): DeepPartial<IInformationOnRequestedBioSamples> | undefined => {
  return typeOfUse?.usage?.includes(ProposalTypeOfUse.Biosample)
    ? {
        _id: informationOnRequestedBioSamples?._id,
        isDone: informationOnRequestedBioSamples?.isDone ?? false,
        noSampleRequired: informationOnRequestedBioSamples?.noSampleRequired ?? false,
        laboratoryResources: transformEmptyStringToUndefined(informationOnRequestedBioSamples?.laboratoryResources),
        biosamples: transformBiosamples(informationOnRequestedBioSamples?.biosamples, transformToApi),
      }
    : undefined
}

export const mapBiosample = (biosample?: Partial<IBiosample>): Partial<IBiosample> => {
  return {
    _id: biosample?._id ?? NEW_ID,
    typeDetails: transformEmptyStringToUndefined(biosample?.typeDetails),
    parameter: transformEmptyStringToUndefined(biosample?.parameter),
    requirements: transformEmptyStringToUndefined(biosample?.requirements),
    count: transformEmptyStringToUndefined(biosample?.count),
    sampleCode: biosample?.sampleCode?.filter((code): code is BiosampleCode => code !== undefined) ?? [],
    [BiosampleCode.SNOMED]: transformEmptyStringToUndefined(biosample?.[BiosampleCode.SNOMED]),
    [BiosampleCode.SPREC]: transformEmptyStringToUndefined(biosample?.[BiosampleCode.SPREC]),
    method: transformEmptyStringToUndefined(biosample?.method),
    externalLabTransfer: biosample?.externalLabTransfer ?? false,
    externalLabTransferDetails: transformEmptyStringToUndefined(biosample?.externalLabTransferDetails),
    optionalBiosample: biosample?.optionalBiosample ?? false,
    type: biosample?.type,
  }
}
export const transformBiosamples = (
  biosamples?: DeepPartial<IBiosample[]>,
  transformToApi?: boolean,
): DeepPartial<IBiosample[]> | undefined => {
  if (biosamples) {
    const filteredBiosamples = biosamples
      .map((biosample) => {
        if (!biosample) return undefined
        return mapBiosample(biosample as Partial<IBiosample>)
      })
      .filter((biosample): biosample is Partial<IBiosample> => biosample !== undefined && !hasNoContent(biosample))

    const isEmpty = filteredBiosamples.length <= 0
    if (!isEmpty) {
      return filteredBiosamples
    }
  }

  // If it's empty we don't need to create it in the api, but we like to have an empty version for the ui
  return transformToApi ? undefined : [mapBiosample()]
}

const transformSelectionOfCases = (selectionOfCases?: Partial<ISelectionOfCases>): ISelectionOfCases => {
  return {
    difeSelectionOfCases: {
      selectedCases: selectionOfCases?.difeSelectionOfCases?.selectedCases ?? [],
      otherExplanation: transformEmptyStringToUndefined(selectionOfCases?.difeSelectionOfCases?.otherExplanation),
    },
    _id: selectionOfCases?._id,
    isDone: selectionOfCases?.isDone ?? false,
  }
}

const transformVariableSelection = (variableSelection?: IVariableSelectionData): IVariableSelectionData => {
  return {
    [PlatformIdentifier.DIFE]: {
      typeOfUse: variableSelection?.DIFE?.typeOfUse,
      typeOfUseExplanation: variableSelection?.DIFE?.typeOfUseExplanation,
    },
    _id: variableSelection?._id,
    isDone: variableSelection?.isDone ?? false,
  }
}

export const mapSelectedCohorts = (cohort?: ISelectedCohort): ISelectedCohort => {
  return {
    _id: cohort?._id ?? NEW_ID,
    feasibilityQueryId: cohort?.feasibilityQueryId ?? 0,
    label: transformEmptyStringToUndefined(cohort?.label),
    comment: transformEmptyStringToUndefined(cohort?.comment),
    uploadId: cohort?.uploadId ?? undefined,
    numberOfPatients: cohort?.numberOfPatients,
  }
}

export const transformCohorts = (cohorts?: ICohort): ICohort => {
  return {
    selectedCohorts: cohorts?.selectedCohorts?.map((c) => mapSelectedCohorts(c)) ?? [],
    details: transformEmptyStringToUndefined(cohorts?.details),
    _id: cohorts?._id,
    isDone: cohorts?.isDone,
  }
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
      userProject?.informationOnRequestedBioSamples?.noSampleRequired,
      userProject?.informationOnRequestedBioSamples?.laboratoryResources,
      userProject?.informationOnRequestedBioSamples,
      userProject?.typeOfUse,
      transformToApi,
    ),
    variableSelection: transformVariableSelection(userProject?.variableSelection),
    selectionOfCases: transformSelectionOfCases(userProject?.selectionOfCases),
    cohorts: transformCohorts(userProject?.cohorts),
  }
}
