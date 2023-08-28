import { getProjectStatus } from '../project-status-diz'
import { ProjectStatusType, type IProposal, ProposalStatus, LocationState } from '@/types/proposal.types'

vi.mock('@/utils/date.util', () => ({
  getLocaleDateString: vi.fn().mockReturnValue('getLocaleDateString'),
}))

describe('Project Status Handling for DIZ', () => {
  it('should handle locked status', () => {
    const proposal = {
      isLocked: true,
    } as any as IProposal

    const result = getProjectStatus(proposal)

    const expectedResult = {
      type: ProjectStatusType.warning,
      description: 'projectStatus.PROJECT_IS_LOCKED',
    }

    expect(result).toEqual(expectedResult)
  })

  it('should handle rejected status', () => {
    const proposal = {
      isLocked: false,
      status: ProposalStatus.Rejected,
      locationStatus: LocationState.SignedContract,
    } as any as IProposal

    const result = getProjectStatus(proposal)

    const expectedResult = {
      type: ProjectStatusType.neutral,
      description: 'projectStatus.REJECTED',
    }

    expect(result).toEqual(expectedResult)
  })

  describe('handling of location status', () => {
    const testcases: [LocationState, Record<string, any>, string?][] = [
      [
        LocationState.IsDizCheck,
        {
          type: ProjectStatusType.warning,
          description: 'projectStatus.LOC_DIZ_CHECK',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.DizApproved,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_DIZ_APPROVED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.UacApproved,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_UAC_APPROVED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
        'researcherSignedAt',
      ],
      [
        LocationState.UacApproved,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_WAITING_FOR_RESEARCHER_SIGN',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.SignedContract,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_SIGNED_CONTRACT',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.SignedContractAndContractingDone,
        {
          type: ProjectStatusType.warning,
          description: 'projectStatus.LOC_SIGNED_CONTRACT_AND_CONTRACTING_DONE_FOR_DIZ',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.RequestedButExcluded,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.LOC_REQUESTED_BUT_EXCLUDED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.NotRequested,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.LOC_NOT_REQUESTED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.ConditionalApprovalDeclined,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_DECLINED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.ResearcherRejectedContract,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.LOC_RESEARCHER_REJECTED_CONTRACT_FOR_DIZ',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.ResearcherAcceptedContract,
        {
          type: ProjectStatusType.warning,
          description: 'projectStatus.LOC_RESEARCHER_ACCEPTED_CONTRACT',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.ConditionalApprovalAccepted,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_ACCEPTED',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        LocationState.ConditionalApprovalPending,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_PENDING',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
    ]

    test.each(testcases)(`should handle locationStatus: %s`, (locationStatus, expectedResult, researcherSignedAt) => {
      const proposal = {
        isLocked: false,
        status: ProposalStatus.Contracting,
        locationStatus,
        dueDateForStatus: new Date(),
        researcherSignedAt,
      } as any as IProposal

      const result = getProjectStatus(proposal)

      expect(result).toEqual(expectedResult)
    })
  })
})
