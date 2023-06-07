import type { DeepPartial } from '@/types/deep-partial.type'
import { Countries } from '@/types/location.enum'
import type { IFdpgOidcProfile } from '@/types/oidc.types'
import type {
  IApplicant,
  IInstitute,
  IParticipant,
  IParticipantCategory,
  IProjectResponsibility,
  IProjectResponsible,
  IProjectUser,
  IResearcher,
} from '@/types/proposal.types'
import { hasNoContent, transformEmptyStringToUndefined } from '../empty-string.util'
const NEW_ID = 'NEW_ID'

const transformParticipantResearcher = (
  researcher?: Partial<IResearcher>,
  fdpgUser?: IFdpgOidcProfile,
): Partial<IResearcher> => {
  return {
    _id: researcher?._id,
    isDone: researcher?.isDone ?? false,
    title: transformEmptyStringToUndefined(fdpgUser?.title ?? researcher?.title),
    firstName: transformEmptyStringToUndefined(fdpgUser?.given_name ?? researcher?.firstName),
    lastName: transformEmptyStringToUndefined(fdpgUser?.family_name ?? researcher?.lastName),
    affiliation: transformEmptyStringToUndefined(fdpgUser?.affiliation ?? researcher?.affiliation),
    email: transformEmptyStringToUndefined(fdpgUser?.email ?? researcher?.email),
  }
}

const transformParticipantInstitute = (
  institute?: Partial<IInstitute>,
  fdpgUser?: IFdpgOidcProfile,
): Partial<IInstitute> => {
  let miiLocation = institute?.miiLocation

  if (fdpgUser && 'MII_LOCATION' in fdpgUser) {
    miiLocation = fdpgUser.MII_LOCATION
  } else if (fdpgUser && 'organization' in fdpgUser) {
    const country = Object.values(Countries).includes(fdpgUser.organization.country as Countries)
      ? (fdpgUser.organization.country as Countries)
      : undefined
    return {
      _id: institute?._id,
      isDone: institute?.isDone ?? false,
      miiLocation: undefined,
      name: transformEmptyStringToUndefined(fdpgUser.organization.name),
      streetAddress: transformEmptyStringToUndefined(fdpgUser.organization.street),
      postalCode: transformEmptyStringToUndefined(fdpgUser.organization.postalCode),
      city: transformEmptyStringToUndefined(fdpgUser.organization.city),
      email: transformEmptyStringToUndefined(fdpgUser.organization.email),
      country: country,
      houseNumber: transformEmptyStringToUndefined(fdpgUser.organization?.houseNumber),
    }
  }

  if (miiLocation) {
    return {
      _id: institute?._id,
      isDone: institute?.isDone ?? false,
      miiLocation,
      name: undefined,
      streetAddress: undefined,
      postalCode: undefined,
      city: undefined,
      email: undefined,
      country: undefined,
      houseNumber: undefined,
    }
  }

  return {
    _id: institute?._id,
    isDone: institute?.isDone ?? false,
    miiLocation,
    name: transformEmptyStringToUndefined(institute?.name),
    streetAddress: transformEmptyStringToUndefined(institute?.streetAddress),
    postalCode: transformEmptyStringToUndefined(institute?.postalCode),
    city: transformEmptyStringToUndefined(institute?.city),
    email: transformEmptyStringToUndefined(institute?.email),
    country: institute?.country ?? Countries.DE,
    houseNumber: transformEmptyStringToUndefined(institute?.houseNumber),
  }
}

const transformParticipantCategory = (
  participantCategory?: DeepPartial<IParticipantCategory>,
): Partial<IParticipantCategory> => {
  return {
    _id: participantCategory?._id,
    isDone: participantCategory?.isDone ?? false,
    category: participantCategory?.category,
  }
}

export const transformProjectUser = (projectUser?: DeepPartial<IProjectUser>): Partial<IProjectUser> => {
  return {
    _id: projectUser?._id,
    isDone: projectUser?.isDone ?? false,
    projectUserType: projectUser?.projectUserType,
  }
}

export const transformApplicant = (
  applicant?: DeepPartial<IApplicant>,
  fdpgUser?: IFdpgOidcProfile,
): DeepPartial<IApplicant> => {
  return {
    researcher: transformParticipantResearcher(applicant?.researcher, fdpgUser),
    institute: transformParticipantInstitute(applicant?.institute, fdpgUser),
    participantCategory: transformParticipantCategory(applicant?.participantCategory),
  }
}

const transFormProjectResponsibility = (projectResponsibility?: DeepPartial<IProjectResponsibility>) => {
  return {
    _id: projectResponsibility?._id,
    isDone: projectResponsibility?.isDone ?? false,
    applicantIsProjectResponsible: projectResponsibility?.applicantIsProjectResponsible ?? false,
  }
}
export const transformProjectResponsible = (
  projectResponsible?: DeepPartial<IProjectResponsible>,
  transformToApi?: boolean,
): DeepPartial<IProjectResponsible> => {
  const applicantIsProjectResponsible = projectResponsible?.projectResponsibility?.applicantIsProjectResponsible
  return {
    researcher:
      transformToApi && applicantIsProjectResponsible
        ? undefined
        : transformParticipantResearcher(applicantIsProjectResponsible ? undefined : projectResponsible?.researcher),
    institute:
      transformToApi && applicantIsProjectResponsible
        ? undefined
        : transformParticipantInstitute(applicantIsProjectResponsible ? undefined : projectResponsible?.institute),
    participantCategory:
      transformToApi && applicantIsProjectResponsible
        ? undefined
        : transformParticipantCategory(
            applicantIsProjectResponsible ? undefined : projectResponsible?.participantCategory,
          ),
    projectResponsibility: transFormProjectResponsibility(projectResponsible?.projectResponsibility),
  }
}

export const mapParticipant = (participant?: DeepPartial<IParticipant>): DeepPartial<IParticipant> => {
  return {
    _id: participant?._id ?? NEW_ID,
    researcher: transformParticipantResearcher(participant?.researcher),
    institute: transformParticipantInstitute(participant?.institute),
    participantCategory: transformParticipantCategory(participant?.participantCategory),
  }
}
export const transformParticipants = (participants?: DeepPartial<IParticipant[]>): DeepPartial<IParticipant[]> => {
  if (participants) {
    const filteredParticipants = participants
      ?.map((participant) => mapParticipant(participant))
      .filter((participant) => {
        return !(
          hasNoContent(participant.institute) &&
          hasNoContent(participant.participantCategory) &&
          hasNoContent(participant.researcher)
        )
      })
    const isEmpty = filteredParticipants.length <= 0
    if (!isEmpty) {
      return filteredParticipants
    }
  }

  return []
}
