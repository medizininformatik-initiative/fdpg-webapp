import { describe, it, expect } from 'vitest'
import {
  isProposalEditable,
  isResponsibleScientist,
  isEditor,
  isParticipatingScientist,
  isProposalOwner,
  hasEditingPermissions,
  getProposalPermissions,
} from '../proposal-permissions.util'
import { ProposalStatus, ParticipantRole } from '@/types/proposal.types'
import type { IProposal } from '@/types/proposal.types'
import type { IFdpgOidcProfile } from '@/types/oidc.types'

const mockUserProfile = {
  sub: 'user123',
  email: 'user@example.com',
  given_name: 'John',
  family_name: 'Doe',
  name: 'John Doe',
} as IFdpgOidcProfile

const mockProposal = {
  _id: 'proposal123',
  projectAbbreviation: 'TEST',
  status: ProposalStatus.Draft,
  owner: { id: 'user123' },
  projectResponsible: {
    researcher: { email: 'responsible@example.com' },
  },
  participants: [
    {
      researcher: { email: 'editor@example.com' },
      participantRole: { role: ParticipantRole.Researcher },
    },
    {
      researcher: { email: 'participant@example.com' },
      participantRole: { role: ParticipantRole.ParticipatingScientist },
    },
  ],
} as IProposal

describe('ProposalPermissions', () => {
  describe('isProposalEditable', () => {
    it('should return true for draft proposals', () => {
      const proposal = { ...mockProposal, status: ProposalStatus.Draft }
      expect(isProposalEditable(proposal)).toBe(true)
    })

    it('should return true for rework proposals', () => {
      const proposal = { ...mockProposal, status: ProposalStatus.Rework }
      expect(isProposalEditable(proposal)).toBe(true)
    })

    it('should return false for submitted proposals', () => {
      const proposal = { ...mockProposal, status: ProposalStatus.FdpgCheck }
      expect(isProposalEditable(proposal)).toBe(false)
    })

    it('should return true for undefined status', () => {
      const proposal = { ...mockProposal, status: undefined }
      expect(isProposalEditable(proposal)).toBe(true)
    })
  })

  describe('isResponsibleScientist', () => {
    it('should return true when user is the responsible scientist', () => {
      const userProfile = { ...mockUserProfile, email: 'responsible@example.com' }
      expect(isResponsibleScientist(mockProposal, userProfile)).toBe(true)
    })

    it('should return false when user is not the responsible scientist', () => {
      const userProfile = { ...mockUserProfile, email: 'other@example.com' }
      expect(isResponsibleScientist(mockProposal, userProfile)).toBe(false)
    })

    it('should handle case insensitive emails', () => {
      const userProfile = { ...mockUserProfile, email: 'RESPONSIBLE@EXAMPLE.COM' }
      expect(isResponsibleScientist(mockProposal, userProfile)).toBe(true)
    })

    it('should return false when no user profile provided', () => {
      expect(isResponsibleScientist(mockProposal, undefined)).toBe(false)
    })

    it('should return true when applicant is project responsible and user is applicant', () => {
      const proposalWithApplicantResponsible = {
        ...mockProposal,
        applicant: {
          researcher: { email: 'applicant@example.com' },
        },
        projectResponsible: {
          // No researcher email when applicant is responsible
          projectResponsibility: {
            _id: '68dd481a13b770c9855ed20c',
            isDone: false,
            applicantIsProjectResponsible: true,
          },
        },
      } as IProposal

      const userProfile = { ...mockUserProfile, email: 'applicant@example.com' }
      expect(isResponsibleScientist(proposalWithApplicantResponsible, userProfile)).toBe(true)
    })

    it('should return false when applicant is project responsible but user is not applicant', () => {
      const proposalWithApplicantResponsible = {
        ...mockProposal,
        applicant: {
          researcher: { email: 'applicant@example.com' },
        },
        projectResponsible: {
          // No researcher email when applicant is responsible
          projectResponsibility: {
            _id: '68dd481a13b770c9855ed20c',
            isDone: false,
            applicantIsProjectResponsible: true,
          },
        },
      } as IProposal

      const userProfile = { ...mockUserProfile, email: 'other@example.com' }
      expect(isResponsibleScientist(proposalWithApplicantResponsible, userProfile)).toBe(false)
    })
  })

  describe('isEditor', () => {
    it('should return true when user has editor role', () => {
      const userProfile = { ...mockUserProfile, email: 'editor@example.com' }
      expect(isEditor(mockProposal, userProfile)).toBe(true)
    })

    it('should return false when user has participating scientist role', () => {
      const userProfile = { ...mockUserProfile, email: 'participant@example.com' }
      expect(isEditor(mockProposal, userProfile)).toBe(false)
    })

    it('should return false when user is not a participant', () => {
      const userProfile = { ...mockUserProfile, email: 'nonparticipant@example.com' }
      expect(isEditor(mockProposal, userProfile)).toBe(false)
    })
  })

  describe('isParticipatingScientist', () => {
    it('should return false when user is responsible scientist (not a participant)', () => {
      const userProfile = { ...mockUserProfile, email: 'responsible@example.com' }
      expect(isParticipatingScientist(mockProposal, userProfile)).toBe(false)
    })

    it('should return true when user has participating scientist role', () => {
      const userProfile = { ...mockUserProfile, email: 'participant@example.com' }
      expect(isParticipatingScientist(mockProposal, userProfile)).toBe(true)
    })

    it('should return false when user is not involved', () => {
      const userProfile = { ...mockUserProfile, email: 'outsider@example.com' }
      expect(isParticipatingScientist(mockProposal, userProfile)).toBe(false)
    })
  })

  describe('hasEditingPermissions', () => {
    it('should return true for responsible scientist', () => {
      const userProfile = { ...mockUserProfile, email: 'responsible@example.com' }
      expect(hasEditingPermissions(mockProposal, userProfile)).toBe(true)
    })

    it('should return true for editor', () => {
      const userProfile = { ...mockUserProfile, email: 'editor@example.com' }
      expect(hasEditingPermissions(mockProposal, userProfile)).toBe(true)
    })

    it('should return false for participating scientist without editing role', () => {
      const userProfile = { ...mockUserProfile, sub: 'participant123', email: 'participant@example.com' }
      expect(hasEditingPermissions(mockProposal, userProfile)).toBe(false)
    })
  })

  describe('getProposalPermissions', () => {
    it('should return comprehensive permissions for responsible scientist', () => {
      const userProfile = { ...mockUserProfile, email: 'responsible@example.com' }
      const permissions = getProposalPermissions(mockProposal, userProfile)

      expect(permissions.isResponsible).toBe(true)
      expect(permissions.hasEditingRights).toBe(true)
      expect(permissions.canEdit).toBe(true)
      expect(permissions.isReviewMode).toBe(false)
    })

    it('should return correct permissions for participating scientist without editing rights', () => {
      const userProfile = { ...mockUserProfile, sub: 'participant123', email: 'participant@example.com' }
      const permissions = getProposalPermissions(mockProposal, userProfile)

      expect(permissions.isOwner).toBe(false)
      expect(permissions.isResponsible).toBe(false)
      expect(permissions.isParticipating).toBe(true)
      expect(permissions.isEditor).toBe(false)
      expect(permissions.hasEditingRights).toBe(false)
      expect(permissions.isReviewMode).toBe(true)
    })

    it('should return review mode for non-editable proposals', () => {
      const proposal = { ...mockProposal, status: ProposalStatus.FdpgCheck }
      const userProfile = { ...mockUserProfile, email: 'responsible@example.com' }
      const permissions = getProposalPermissions(proposal, userProfile)

      expect(permissions.isReviewMode).toBe(true)
      expect(permissions.canEdit).toBe(false)
    })
  })
})
