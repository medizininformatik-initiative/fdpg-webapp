import type { DeepPartial } from '@/types/deep-partial.type'
import { Countries } from '@/types/location.enum'
import type { IFdpgOidcProfile } from '@/types/oidc.types'
import type {
  IApplicant,
  IInstitute,
  IParticipant,
  IParticipantCategory,
  IParticipantRole,
  IProjectResponsibility,
  IProjectResponsible,
  IProjectUser,
  IResearcher,
} from '@/types/proposal.types'
import { ParticipantRole } from '@/types/proposal.types'
import { hasNoContent, transformEmptyStringToUndefined } from '../empty-string.util'
const NEW_ID = 'NEW_ID'

const transformParticipantResearcher = (
  researcher?: Partial<IResearcher>,
  fdpgUser?: IFdpgOidcProfile,
): Partial<IResearcher> => {
  const fdpgUserToResearcher = {
    title: fdpgUser?.title,
    firstName: fdpgUser?.given_name,
    lastName: fdpgUser?.family_name,
    affiliation: fdpgUser?.affiliation,
    email: fdpgUser?.email,
  }

  const { title, firstName, lastName, affiliation, email } =
    researcher?._id || researcher?.lastName ? researcher : fdpgUserToResearcher

  return {
    _id: researcher?._id,
    isDone: researcher?.isDone ?? false,
    title: transformEmptyStringToUndefined(title),
    firstName: transformEmptyStringToUndefined(firstName),
    lastName: transformEmptyStringToUndefined(lastName),
    affiliation: transformEmptyStringToUndefined(affiliation),
    email: transformEmptyStringToUndefined(email),
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

const transformParticipantRole = (participantRole?: DeepPartial<IParticipantRole>): Partial<IParticipantRole> => {
  return {
    _id: participantRole?._id,
    isDone: participantRole?.isDone ?? false,
    role: participantRole?.role ?? ParticipantRole.ParticipatingScientist,
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
  let researcher: Partial<IResearcher> | undefined
  let institute: Partial<IInstitute> | undefined
  let participantCategory: Partial<IParticipantCategory> | undefined
  let participantRole: Partial<IParticipantRole> | undefined

  if (transformToApi && applicantIsProjectResponsible) {
    // Both true
    researcher = undefined
    institute = undefined
    participantCategory = undefined
    participantRole = undefined
  } else {
    if (applicantIsProjectResponsible) {
      // transformToApi: false, applicantIsProjectResponsible: true
      researcher = transformParticipantResearcher()
      institute = transformParticipantInstitute()
      participantCategory = transformParticipantCategory()
      participantRole = {
        _id: projectResponsible?.participantRole?._id || 'projectResponsibleRoleId',
        isDone: projectResponsible?.participantRole?.isDone ?? false,
        role: ParticipantRole.ResponsibleScientist,
      }
    } else {
      // Both false || transformToApi: true, applicantIsProjectResponsible: false
      researcher = transformParticipantResearcher(projectResponsible?.researcher)
      institute = transformParticipantInstitute(projectResponsible?.institute)
      participantCategory = transformParticipantCategory(projectResponsible?.participantCategory)
      participantRole = {
        _id: projectResponsible?.participantRole?._id || 'projectResponsibleRoleId',
        isDone: projectResponsible?.participantRole?.isDone ?? false,
        role: ParticipantRole.ResponsibleScientist,
      }
    }
  }

  const projectResponsibility = transFormProjectResponsibility(projectResponsible?.projectResponsibility)

  return {
    researcher,
    institute,
    participantCategory,
    participantRole,
    projectResponsibility,
  }
}

export const mapParticipant = (participant?: DeepPartial<IParticipant>): DeepPartial<IParticipant> => {
  return {
    _id: participant?._id ?? NEW_ID,
    researcher: transformParticipantResearcher(participant?.researcher),
    institute: transformParticipantInstitute(participant?.institute),
    participantCategory: transformParticipantCategory(participant?.participantCategory),
    participantRole: transformParticipantRole(participant?.participantRole),
    addedByFdpg: participant?.addedByFdpg ?? false,
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
