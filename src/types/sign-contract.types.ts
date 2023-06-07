export interface ISignContract {
  value: true
  file: File
}

export interface IDeclineContract {
  value: false
  declineReason: string
}

export type ContractDecision = ISignContract | IDeclineContract
