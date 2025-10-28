import type { IProposal } from '@/types/proposal.types'
import { ParticipantRole, ProposalStatus } from '@/types/proposal.types'
import type { IFdpgOidcProfile } from '@/types/oidc.types'
import { Role } from '@/types/oidc.types'

export interface ProposalPermissions {
  isOwner: boolean
  isParticipating: boolean
  isResponsible: boolean
  isEditor: boolean
  isApplicant: boolean
  hasEditingRights: boolean
  canEdit: boolean
  isReviewMode: boolean
}

/**
 * Determines if a proposal is in an editable status
 * For FDPG members with registering forms, allow editing regardless of status
 */
export function isProposalEditable(proposal?: IProposal, singleKnownRole?: Role): boolean {
  const status = proposal?.status

  // FDPG members can always edit registering forms
  if (singleKnownRole === Role.FdpgMember && proposal?.register?.isRegisteringForm) {
    return true
  }

  // Standard editable statuses for other roles
  return status === undefined || status === ProposalStatus.Draft || status === ProposalStatus.Rework
}

/**
 * Checks if the current user is the responsible scientist for the proposal
 */
export function isResponsibleScientist(proposal: IProposal, userProfile?: IFdpgOidcProfile): boolean {
  const currentUserEmail = userProfile?.email?.toLowerCase()
  if (!currentUserEmail || !proposal.projectResponsible) {
    return false
  }

  // Check if the applicant is the project responsible
  if (proposal.projectResponsible.projectResponsibility?.applicantIsProjectResponsible) {
    // When applicant is project responsible, check if current user is the applicant
    return proposal.applicant?.researcher?.email?.toLowerCase() === currentUserEmail
  }

  // Otherwise check the project responsible scientist email (if researcher exists)
  if (!proposal.projectResponsible.researcher) {
    return false
  }
  return proposal.projectResponsible.researcher.email?.toLowerCase() === currentUserEmail
}

/**
 * Checks if the current user has editor role (ParticipantRole.Researcher) in the proposal
 */
export function isEditor(proposal: IProposal, userProfile?: IFdpgOidcProfile): boolean {
  const currentUserEmail = userProfile?.email?.toLowerCase()
  if (!currentUserEmail || !proposal.participants) {
    return false
  }

  return proposal.participants.some((participant) => {
    const participantEmail = participant.researcher?.email?.toLowerCase()
    return participantEmail === currentUserEmail && participant.participantRole?.role === ParticipantRole.Researcher
  })
}

/**
 * Checks if the current user is a participating scientist
 */
export function isParticipatingScientist(proposal: IProposal, userProfile?: IFdpgOidcProfile): boolean {
  const currentUserEmail = userProfile?.email?.toLowerCase()
  if (!currentUserEmail) {
    return false
  }

  // Check if user is in participants list
  return (
    proposal.participants?.some(
      (participant) =>
        participant.researcher?.email?.toLowerCase() === currentUserEmail &&
        participant.participantRole.role === ParticipantRole.ParticipatingScientist,
    ) ?? false
  )
}

/**
 * Checks if the current user is the proposal owner
 */
export function isProposalOwner(proposal: IProposal, userProfile?: IFdpgOidcProfile): boolean {
  return proposal.owner?.id === userProfile?.sub
}

/**
 * Checks if the current user is the applicant of the proposal
 */
export function isApplicant(proposal: IProposal, userProfile?: IFdpgOidcProfile): boolean {
  const currentUserEmail = userProfile?.email?.toLowerCase()
  if (!currentUserEmail || !proposal.applicant) {
    return false
  }

  return proposal.applicant.researcher?.email?.toLowerCase() === currentUserEmail
}

/**
 * Checks if a specific participant is the applicant of the proposal
 */
export function isParticipantApplicant(proposal: IProposal, participantEmail: string): boolean {
  if (!proposal.applicant || !participantEmail) {
    return false
  }

  return proposal.applicant.researcher?.email?.toLowerCase() === participantEmail.toLowerCase()
}

/**
 * Determines if the current user has editing permissions (responsible scientist or editor or owner)
 */
export function hasEditingPermissions(
  proposal: IProposal,
  userProfile?: IFdpgOidcProfile,
  singleKnownRole?: Role,
): boolean {
  // For new proposals (no ID), allow editing if user has sub
  if (!proposal._id && userProfile?.sub) {
    return true
  }

  // FDPG members can always edit registering forms
  if (singleKnownRole === Role.FdpgMember && proposal?.register?.isRegisteringForm) {
    return true
  }

  return (
    isResponsibleScientist(proposal, userProfile) ||
    isEditor(proposal, userProfile) ||
    isProposalOwner(proposal, userProfile)
  )
}

/**
 * Comprehensive function to get all proposal permissions for the current user
 */
export function getProposalPermissions(
  proposal: IProposal,
  userProfile?: IFdpgOidcProfile,
  isParticipatingFromApi?: boolean,
  singleKnownRole?: Role,
): ProposalPermissions {
  const owner = isProposalOwner(proposal, userProfile)
  const participating = isParticipatingFromApi ?? isParticipatingScientist(proposal, userProfile)
  const responsible = isResponsibleScientist(proposal, userProfile)
  const editor = isEditor(proposal, userProfile)
  const editingRights = hasEditingPermissions(proposal, userProfile, singleKnownRole)
  const editable = isProposalEditable(proposal, singleKnownRole)
  const applicant = isApplicant(proposal, userProfile)
  const canEdit = editable && editingRights

  // Review mode: proposal not editable OR user doesn't have editing rights
  const reviewMode = !editable || !editingRights

  return {
    isOwner: owner,
    isParticipating: participating,
    isResponsible: responsible,
    isEditor: editor,
    isApplicant: applicant,
    hasEditingRights: editingRights,
    canEdit,
    isReviewMode: reviewMode,
  }
}
