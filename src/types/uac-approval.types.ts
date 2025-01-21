export interface IUacApproval {
  value: true
  dataAmount: number
  file?: File
  conditionReasoning?: string
}

export interface IDeclineUacApproval {
  value: false
  declineReason: string
}

export type UacApprovalDecision = IUacApproval | IDeclineUacApproval
