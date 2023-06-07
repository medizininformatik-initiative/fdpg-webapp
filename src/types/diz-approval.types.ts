export interface IDizApproval {
  value: true
}

export interface IDeclineDizApproval {
  value: false
  declineReason: string
}

export type DizApprovalDecision = IDizApproval | IDeclineDizApproval
