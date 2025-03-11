import { DueDateEnum } from '@/types/due-date.enum'
import { ProposalStatus } from '@/types/proposal.types'

export const beforeDeadlineDateConstrains: Record<DueDateEnum, DueDateEnum | null> = {
  [DueDateEnum.DUE_DAYS_FDPG_CHECK]: null,
  [DueDateEnum.DUE_DAYS_LOCATION_CHECK]: DueDateEnum.DUE_DAYS_FDPG_CHECK,
  [DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING]: DueDateEnum.DUE_DAYS_LOCATION_CHECK,
  [DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY]: DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
  [DueDateEnum.DUE_DAYS_DATA_CORRUPT]: DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
  [DueDateEnum.DUE_DAYS_FINISHED_PROJECT]: DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
}

export interface DeadlineOrder {
  isLocked: Boolean
  order: Number
  deadlineType: DueDateEnum
  minDate?: Date
  maxDate?: Date
}

export const defaultDeadlineOrderList: DeadlineOrder[] = [
  DueDateEnum.DUE_DAYS_FDPG_CHECK,
  DueDateEnum.DUE_DAYS_LOCATION_CHECK,
  DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
  DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
  DueDateEnum.DUE_DAYS_DATA_CORRUPT,
  DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
].map((deadline, i) => {
  return {
    isLocked: false,
    order: i,
    deadlineType: deadline,
  }
})

export const statusToDueDatesMap: Record<ProposalStatus, DueDateEnum[]> = {
  [ProposalStatus.Draft]: [
    DueDateEnum.DUE_DAYS_FDPG_CHECK,
    DueDateEnum.DUE_DAYS_LOCATION_CHECK,
    DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
    DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
    DueDateEnum.DUE_DAYS_DATA_CORRUPT,
    DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
  ],
  [ProposalStatus.FdpgCheck]: [
    DueDateEnum.DUE_DAYS_FDPG_CHECK,
    DueDateEnum.DUE_DAYS_DATA_CORRUPT,
    DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
    DueDateEnum.DUE_DAYS_LOCATION_CHECK,
    DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
    DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
  ],
  [ProposalStatus.LocationCheck]: [
    DueDateEnum.DUE_DAYS_DATA_CORRUPT,
    DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
    DueDateEnum.DUE_DAYS_LOCATION_CHECK,
    DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
    DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
  ],
  [ProposalStatus.Contracting]: [
    DueDateEnum.DUE_DAYS_DATA_CORRUPT,
    DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
    DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
    DueDateEnum.DUE_DAYS_LOCATION_CONTRACTING,
  ],
  [ProposalStatus.ExpectDataDelivery]: [
    DueDateEnum.DUE_DAYS_DATA_CORRUPT,
    DueDateEnum.DUE_DAYS_FINISHED_PROJECT,
    DueDateEnum.DUE_DAYS_EXPECT_DATA_DELIVERY,
  ],
  [ProposalStatus.DataCorrupt]: [DueDateEnum.DUE_DAYS_DATA_CORRUPT, DueDateEnum.DUE_DAYS_FINISHED_PROJECT],
  [ProposalStatus.FinishedProject]: [DueDateEnum.DUE_DAYS_FINISHED_PROJECT],
  [ProposalStatus.Archived]: [],
  [ProposalStatus.Rejected]: [],
  [ProposalStatus.Rework]: [],
  [ProposalStatus.ReadyToArchive]: [],
  [ProposalStatus.DataResearch]: [],
}
export function cleanDueDateKey(key: string): string {
  return key.replace(/^DUE_DAYS_/, '') // Remove "DUE_DAYS_" prefix
}
