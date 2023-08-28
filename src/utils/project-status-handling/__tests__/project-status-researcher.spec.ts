import { ProjectStatusType, type IProposal, ProposalStatus } from '@/types/proposal.types'
import { getProjectStatus } from '../project-status-researcher'

vi.mock('@/utils/date.util', () => ({
  getLocaleDateString: vi.fn().mockReturnValue('getLocaleDateString'),
}))

describe('handling of project status for researcher', () => {
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

  describe('handling of proposal status', () => {
    const testcases: [ProposalStatus, Record<string, any>][] = [
      [
        ProposalStatus.Draft,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.DRAFT',
        },
      ],
      [
        ProposalStatus.Rejected,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.REJECTED',
        },
      ],
      [
        ProposalStatus.Archived,
        {
          type: ProjectStatusType.neutral,
          description: 'projectStatus.ARCHIVED',
        },
      ],
      [
        ProposalStatus.Rework,
        {
          type: ProjectStatusType.warning,
          description: 'projectStatus.REWORK',
        },
      ],
      [
        ProposalStatus.FdpgCheck,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.FDPG_CHECK_FOR_RESEARCHER',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        ProposalStatus.LocationCheck,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOCATION_CHECK',
          descriptionI18nParameter: { date: 'getLocaleDateString' },
        },
      ],
      [
        ProposalStatus.Contracting,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.CONTRACTING',
        },
      ],
      [
        ProposalStatus.ExpectDataDelivery,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.EXPECT_DATA_DELIVERY',
        },
      ],
      [
        ProposalStatus.DataResearch,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.DATA_RESEARCH',
        },
      ],
      [
        ProposalStatus.DataCorrupt,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.DATA_CORRUPT',
        },
      ],
      [
        ProposalStatus.FinishedProject,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.FINISHED_PROJECT',
        },
      ],
      [
        ProposalStatus.ReadyToArchive,
        {
          type: ProjectStatusType.info,
          description: 'projectStatus.READY_TO_ARCHIVE',
        },
      ],
    ]

    test.each(testcases)('should handle %s status', (status, expectedResult) => {
      const proposal = {
        isLocked: false,
        status,
      } as any as IProposal

      const result = getProjectStatus(proposal)

      expect(result).toEqual(expectedResult)
    })
  })
})
