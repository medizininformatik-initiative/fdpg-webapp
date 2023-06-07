import { CommentService } from '@/services/comment/comment.service'
import type {
  IComment,
  ICommentDetail,
  ICommentGetProps,
  ICommentCreateProps,
  ICreateAnswer,
} from '@/types/comment.interface'
import { defineStore } from 'pinia'

export interface ICommentState {
  apiService: CommentService
  comments: ICommentDetail[]
}

export const useCommentStore = defineStore('Comment', {
  state: (): ICommentState => ({
    apiService: new CommentService(),
    comments: [],
  }),

  actions: {
    async fetchAll(props: ICommentGetProps): Promise<void> {
      const data = await this.apiService.getAll(props)
      this.comments = data
    },

    async createComment(props: ICommentCreateProps, comment: IComment): Promise<void> {
      const data = await this.apiService.create(props, comment)
      this.comments.push(data)
    },

    async createAnswer(commentId: string, answer: ICreateAnswer): Promise<void> {
      const response = await this.apiService.createAnswer(commentId, answer)
      const index = this.comments.findIndex((currentComments) => currentComments._id === response._id)

      if (index !== -1) {
        this.comments[index] = response
      }
    },

    async markCommentAsDone(commentId: string, value: boolean): Promise<void> {
      await this.apiService.markCommentAsDone(commentId, value)

      const index = this.comments.findIndex((currentComments) => currentComments._id === commentId)

      if (index !== -1) {
        this.comments[index].isDone = value
      }
    },

    async markAnswerAsDone(commentId: string, answerId: string, value: boolean): Promise<void> {
      await this.apiService.markAnswerAsDone(commentId, answerId, value)

      const commentIndex = this.comments.findIndex((currentComments) => currentComments._id === commentId)

      if (commentIndex !== -1) {
        const answer = this.comments[commentIndex].answers.find((answer) => answer._id === answerId)
        if (answer) {
          answer.isDone = value
        }
      }
    },

    async updateComment(id: string, updatedComment: IComment): Promise<void> {
      const data = await this.apiService.update(id, updatedComment)
      const index = this.comments.findIndex((comment) => comment._id === id) ?? -1
      if (index !== -1) {
        this.comments.splice(index, 1, data)
      }
    },

    async deleteComment(id: string): Promise<void> {
      await this.apiService.delete(id)

      // Find and delete deleted comment
      const index = this.comments.findIndex((comment) => comment._id === id) ?? -1
      if (index !== -1) {
        this.comments.splice(index, 1)
      }
    },
  },

  getters: {
    commentsObj: (state) => {
      const comments: Record<string, ICommentDetail[]> = {}
      state.comments.forEach((comment) => {
        if (comment.referenceObjectId in comments) {
          comments[comment.referenceObjectId].push(comment)
        } else {
          comments[comment.referenceObjectId] = [comment]
        }
      })
      return comments
    },
  },
})
