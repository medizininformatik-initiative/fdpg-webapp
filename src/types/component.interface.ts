import type { UploadFileType } from '@/types/proposal.types'

export interface IAttachmentsInterface {
  name: string
  size: number
  type: UploadFileType
}
