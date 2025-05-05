export interface IFeasibilityDetailCcdlDataSelectionDetail {
  exists: boolean
  isValid: boolean
}

export interface IFeasibilityDetail {
  id: number
  label: string
  comment: string
  lastModified: string
  resultSize: number
  ccdl: IFeasibilityDetailCcdlDataSelectionDetail
  dataSelection: IFeasibilityDetailCcdlDataSelectionDetail
}
