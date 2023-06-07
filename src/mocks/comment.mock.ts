import type { IAnswerDetail, IComment, ICommentDetail, ICreateAnswer } from '@/types/comment.interface';
import { CommentType } from '@/types/comment.interface'
import { MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'

export const mockCommentAnswerDetail: IAnswerDetail = {
  content: 'This is the content of the answer',
  versionOfItem: {
    mayor: 1,
    minor: 0,
  },
  createdAt: '2022-08-30T13:08:37.870+00:00',
  updatedAt: '2022-08-30T13:08:37.870+00:00',
  _id: 'answerId',
  owner: {
    role: Role.DizMember,
    miiLocation: MiiLocation.UMG,
  },
  locations: [],
  isDone: false,
}

export const mockCommentDetailForTask: ICommentDetail = {
  createdAt: '2022-08-30T13:08:37.870+00:00',
  updatedAt: '2022-08-30T13:08:37.870+00:00',
  _id: 'commentId',
  isDone: false,
  owner: {
    role: Role.FdpgMember,
  },
  locations: [],
  referenceObjectId: 'referenceObjectId',
  content: 'This is the content of the task',
  type: CommentType.PROPOSAL_TASK,
  versionOfItem: {
    mayor: 1,
    minor: 0,
  },
  answers: [mockCommentAnswerDetail],
}

export const mockCommentCreate: IComment = {
  locations: [],
  content: 'Content of comment',
  type: CommentType.PROPOSAL_MESSAGE_TO_OWNER,
  versionOfItem: {
    mayor: 1,
    minor: 0,
  },
}

export const mockCommentAnswerCreate: ICreateAnswer = {
  locations: [MiiLocation.UMG],
  content: 'Content of comment',
}
