import type { IProjectStatus } from '@/types/project-status'
import type { IProposal} from '@/types/proposal.types';
import { LocationState, ProjectStatusType, ProposalStatus } from '@/types/proposal.types'
import { getLocaleDateString } from '../date.util'

export const getProjectStatus = (proposal: IProposal): IProjectStatus => {
  if (proposal.isLocked) {
    return {
      type: ProjectStatusType.warning,
      description: 'projectStatus.PROJECT_IS_LOCKED',
    }
  }
  if (
    proposal.status === ProposalStatus.Rejected &&
    proposal.locationStatus !== LocationState.ResearcherRejectedContract
  ) {
    return {
      type: ProjectStatusType.neutral,
      description: 'projectStatus.REJECTED',
    }
  }

  switch (proposal.locationStatus) {
    case LocationState.IsDizCheck:
      return {
        type: ProjectStatusType.warning,
        description: 'projectStatus.LOC_DIZ_CHECK',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.DizApproved:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOC_DIZ_APPROVED',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.UacApproved:
      if (proposal.researcherSignedAt !== undefined) {
        return {
          type: ProjectStatusType.info,
          description: 'projectStatus.LOC_UAC_APPROVED',
          descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
        }
      }
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOC_WAITING_FOR_RESEARCHER_SIGN',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.SignedContract:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOC_SIGNED_CONTRACT',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.SignedContractAndContractingDone:
      return {
        type: ProjectStatusType.warning,
        description: 'projectStatus.LOC_SIGNED_CONTRACT_AND_CONTRACTING_DONE_FOR_DIZ',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.RequestedButExcluded:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.LOC_REQUESTED_BUT_EXCLUDED',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.NotRequested:
    default:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.LOC_NOT_REQUESTED',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.ConditionalApprovalDeclined:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_DECLINED',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.ResearcherRejectedContract:
      return {
        type: ProjectStatusType.neutral,
        description: 'projectStatus.LOC_RESEARCHER_REJECTED_CONTRACT_FOR_DIZ',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.ResearcherAcceptedContract:
      return {
        type: ProjectStatusType.warning,
        description: 'projectStatus.LOC_RESEARCHER_ACCEPTED_CONTRACT',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.ConditionalApprovalAccepted:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_ACCEPTED',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
    case LocationState.ConditionalApprovalPending:
      return {
        type: ProjectStatusType.info,
        description: 'projectStatus.LOC_CONDITIONAL_APPROVAL_PENDING',
        descriptionI18nParameter: { date: getLocaleDateString(proposal.dueDateForStatus) },
      }
  }
}
