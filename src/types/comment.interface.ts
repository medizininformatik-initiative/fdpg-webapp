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
  locations: string[]
  content: string
  type: CommentType
  versionOfItem?: VersionItem
}

export interface ICommentOwner {
  miiLocation?: string
  role: Role
}
export interface ICommentDetail {
  createdAt: string
  updatedAt: string
  _id: string
  isDone?: boolean
  owner: ICommentOwner
  locations: string[]
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
  locations?: string[]
  isDone: boolean
}

export interface ICreateAnswer extends Pick<IAnswerDetail, 'locations' | 'content'> {}
