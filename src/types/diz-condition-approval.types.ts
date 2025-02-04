export interface IDizConditionApproval {
  value: true
  dataAmount: Number
  conditionReasoning?: string
}

export interface IDeclineDizConditionApproval {
  value: false
  declineReason: string
}

export type DizConditionApprovalDecision = IDizConditionApproval | IDeclineDizConditionApproval
