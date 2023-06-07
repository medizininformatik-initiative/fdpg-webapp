import { ApiClient } from '@/httpClients/api/api.client'
import type {
  IComment,
  ICommentDetail,
  ICommentGetProps,
  ICommentCreateProps,
  ICreateAnswer,
} from '@/types/comment.interface'

export class CommentService {
  private basePath = '/comments'
  private apiClient = new ApiClient().client

  async getAll({ proposalId }: ICommentGetProps): Promise<ICommentDetail[]> {
    const params = {
      referenceDocumentId: proposalId,
    }
    const response = await this.apiClient.get(this.basePath, { params })
    return response.data
  }

  async create({ proposalId, objectId }: ICommentCreateProps, comment: IComment): Promise<ICommentDetail> {
    const params = {
      referenceDocumentId: proposalId,
      referenceObjectId: objectId,
      referenceType: 'PROPOSAL',
    }
    const response = await this.apiClient.post(this.basePath, comment, { params })
    return response.data
  }

  async createAnswer(commentId: string, answer: ICreateAnswer): Promise<ICommentDetail> {
    const response = await this.apiClient.post(`${this.basePath}/${commentId}/answers`, answer)
    return response.data
  }

  async update(id: string, comment: IComment): Promise<ICommentDetail> {
    const response = await this.apiClient.put(`${this.basePath}/${id}`, comment)
    return response.data
  }

  async markCommentAsDone(commentId: string, value: boolean): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${commentId}/isDone`, { value })
  }

  async markAnswerAsDone(commentId: string, answerId: string, value: boolean): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${commentId}/answers/${answerId}/isDone`, { value })
  }

  async delete(id: string): Promise<void> {
    const response = await this.apiClient.delete(`${this.basePath}/${id}`)
    return response.data
  }
}
