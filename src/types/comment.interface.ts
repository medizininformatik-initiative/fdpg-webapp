import type { MiiLocation } from '@/types/location.enum'
import type { Role } from './oidc.types'
import type { IVersion } from './version.interface'

export interface ICommentGetProps {
  proposalId: string
}

export interface ICommentCreateProps extends ICommentGetProps {
  objectId: string
}

export interface ICommentForm {
  comment: string
}

export enum CommentType {
  PROPOSAL_TASK = 'PROPOSAL_TASK',
  PROPOSAL_MESSAGE_TO_OWNER = 'PROPOSAL_MESSAGE_TO_OWNER',
  PROPOSAL_MESSAGE_TO_LOCATION = 'PROPOSAL_MESSAGE_TO_LOCATION',
}

interface VersionItem {
  mayor: number
  minor: number
}

export interface IComment {
  locations: MiiLocation[]
  content: string
  type: CommentType
  versionOfItem?: VersionItem
}

export interface ICommentOwner {
  miiLocation?: MiiLocation
  role: Role
}
export interface ICommentDetail {
  createdAt: string
  updatedAt: string
  _id: string
  isDone?: boolean
  owner: ICommentOwner
  locations: MiiLocation[]
  referenceObjectId: string
  content: string
  type: CommentType
  versionOfItem: VersionItem
  answers: IAnswerDetail[]
}

export interface IAnswerDetail {
  content: string
  versionOfItem: IVersion
  createdAt: string
  updatedAt: string
  _id: string
  owner: ICommentOwner
  locations?: MiiLocation[]
  isDone: boolean
}

export interface ICreateAnswer extends Pick<IAnswerDetail, 'locations' | 'content'> {}
