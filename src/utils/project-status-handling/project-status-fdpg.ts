import type { IProjectStatus } from '@/types/project-status'
import type { IProposal } from '@/types/proposal.types'
import { ProjectStatusType, ProposalStatus } from '@/types/proposal.types'
import { getLocaleDateString } from '@/utils/date.util'

export const getProjectStatus = (proposal: IProposal): IProjectStatus => {
  if (proposal.isLocked) {
    return {
      type: ProjectStatusType.warning,
      description: 'projectStatus.PROJECT_IS_LOCKED',
    }
  }
  switch (proposal.status) {
    default:
    case ProposalStatus.Draft:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.DRAFT',
      }
    case ProposalStatus.Rejected:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.REJECTED',
      }
    case ProposalStatus.Archived:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.ARCHIVED',
      }
    case ProposalStatus.Rework:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.REWORK',
      }
    case ProposalStatus.FdpgCheck:
      return {
        type: ProjectStatusType.warning,
        description: 'projectStatus.FDPG_CHECK_FOR_FDPG',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case ProposalStatus.LocationCheck:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOCATION_CHECK',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case ProposalStatus.Contracting:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.CONTRACTING',
      }
    case ProposalStatus.ExpectDataDelivery:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.EXPECT_DATA_DELIVERY',
      }
    case ProposalStatus.DataResearch:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.DATA_RESEARCH',
      }
    case ProposalStatus.DataCorrupt:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.DATA_CORRUPT',
      }
    case ProposalStatus.FinishedProject:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.FINISHED_PROJECT',
      }
    case ProposalStatus.ReadyToArchive:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.READY_TO_ARCHIVE',
      }
  }
}
