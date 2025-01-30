export interface IUacApproval {
  value: true
  file?: File
  conditionReasoning?: string
}

export interface IDeclineUacApproval {
  value: false
  declineReason: string
}

export type UacApprovalDecision = IUacApproval | IDeclineUacApproval
