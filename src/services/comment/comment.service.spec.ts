import { ApiClient } from '@/httpClients/api/api.client'
import { mockCommentAnswerCreate, mockCommentCreate } from '@/mocks/comment.mock'
import type { AxiosInstance } from 'axios'
import type { MockedObject } from 'vitest'
import { CommentService } from './comment.service'

vi.mock('@/httpClients/api/api.client')

const mockGetResponse = {
  data: 'Hello World',
}

describe('CommentService', () => {
  let service: CommentService
  let apiClient: MockedObject<AxiosInstance>
  const basePath = '/comments'

  beforeEach(() => {
    apiClient = new ApiClient().client as MockedObject<AxiosInstance>
    vi.clearAllMocks()
    service = new CommentService()
  })

  describe('GetAll', () => {
    it('should call the api client to get all comments of a proposal', async () => {
      const proposalId = 'abc-1'
      const params = {
        referenceDocumentId: proposalId,
      }
      apiClient.get.mockResolvedValueOnce(mockGetResponse)
      const response = await service.getAll({ proposalId })
      expect(apiClient.get).toHaveBeenCalledWith(`${basePath}`, { params })
      expect(response).toEqual(mockGetResponse.data)
    })
  })

  describe('Create', () => {
    it('should call the api client to create a comment', async () => {
      const proposalId = 'abc-1'
      const objectId = 'abc-2'
      const commentCreateProps = { proposalId, objectId }
      const params = {
        referenceDocumentId: proposalId,
        referenceObjectId: objectId,
        referenceType: 'PROPOSAL',
      }
      apiClient.post.mockResolvedValueOnce(mockGetResponse)
      const response = await service.create(commentCreateProps, mockCommentCreate)
      expect(apiClient.post).toHaveBeenCalledWith(`${basePath}`, mockCommentCreate, { params })
      expect(response).toEqual(mockGetResponse.data)
    })
  })

  describe('CreateAnswer', () => {
    it('should call the api client to create a comment answer', async () => {
      const commentId = 'abc-3'
      apiClient.post.mockResolvedValueOnce(mockGetResponse)
      const response = await service.createAnswer(commentId, mockCommentAnswerCreate)
      expect(apiClient.post).toHaveBeenCalledWith(`${basePath}/${commentId}/answers`, mockCommentAnswerCreate)
      expect(response).toEqual(mockGetResponse.data)
    })
  })

  describe('Update', () => {
    it('should call the api client to updaet a comment', async () => {
      const commentId = 'abc-3'
      apiClient.put.mockResolvedValueOnce(mockGetResponse)
      const response = await service.update(commentId, mockCommentCreate)
      expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${commentId}`, mockCommentCreate)
      expect(response).toEqual(mockGetResponse.data)
    })
  })

  describe('MarkCommentAsDone', () => {
    it('should call the api client to mark a comment as done', async () => {
      const commentId = 'abc-3'
      apiClient.put.mockResolvedValueOnce(mockGetResponse)
      await service.markCommentAsDone(commentId, true)
      expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${commentId}/isDone`, { value: true })
    })
  })

  describe('MarkAnswerAsDone', () => {
    it('should call the api client to mark a comment answer as done', async () => {
      const commentId = 'abc-3'
      const answerId = 'abc-4'
      apiClient.put.mockResolvedValueOnce(mockGetResponse)
      await service.markAnswerAsDone(commentId, answerId, true)
      expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${commentId}/answers/${answerId}/isDone`, { value: true })
    })
  })

  describe('Delete', () => {
    it('should call the api client to delete a comment', async () => {
      const commentId = 'abc-3'
      apiClient.delete.mockResolvedValueOnce(mockGetResponse)
      await service.delete(commentId)
      expect(apiClient.delete).toHaveBeenCalledWith(`${basePath}/${commentId}`)
    })
  })
})
