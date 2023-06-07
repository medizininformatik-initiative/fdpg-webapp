export interface IUacApproval {
  value: true
  dataAmount: number
  file?: File
}

export interface IDeclineUacApproval {
  value: false
  declineReason: string
}

export type UacApprovalDecision = IUacApproval | IDeclineUacApproval
