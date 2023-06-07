import { mockCommentAnswerCreate, mockCommentDetailForTask } from '@/mocks/comment.mock'
import { CommentService } from '@/services/comment/comment.service'
import { createPinia, setActivePinia } from 'pinia'
import { useCommentStore } from './comment.store'

vi.mock('@/services/comment/comment.service')

const commentService = vi.mocked(new CommentService())

describe('Comment Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useCommentStore()
    expect(store).toBeTruthy()
  })

  describe('GetAll', () => {
    it('should call the service to get all comments of a proposal', async () => {
      const store = useCommentStore()
      const proposalId = 'abc-1'
      commentService.getAll.mockResolvedValueOnce([mockCommentDetailForTask])
      await store.fetchAll({ proposalId })
      expect(commentService.getAll).toHaveBeenCalledWith({ proposalId })
      expect(store.comments).toEqual([mockCommentDetailForTask])
    })
  })

  describe('createComment', () => {
    it('should call the service to create a comment of a proposal', async () => {
      const store = useCommentStore()
      const proposalId = 'abc-1'
      const objectId = 'abc-2'
      const commentCreateProps = { proposalId, objectId }

      commentService.create.mockResolvedValueOnce(mockCommentDetailForTask)
      await store.createComment(commentCreateProps, mockCommentDetailForTask)
      expect(commentService.create).toHaveBeenCalledWith(commentCreateProps, mockCommentDetailForTask)
      expect(store.comments).toEqual([mockCommentDetailForTask])
    })
  })

  describe('createAnswer', () => {
    it('should call the service to create a comment answer', async () => {
      const store = useCommentStore()
      const commentId = 'abc-3'
      store.comments = [mockCommentDetailForTask]
      commentService.createAnswer.mockResolvedValueOnce(mockCommentDetailForTask)
      await store.createAnswer(commentId, mockCommentAnswerCreate)
      expect(commentService.createAnswer).toHaveBeenCalledWith(commentId, mockCommentAnswerCreate)
      expect(store.comments).toEqual([mockCommentDetailForTask])
    })
  })

  describe('markCommentAsDone', () => {
    it('should call the service to mark a comment as done', async () => {
      const store = useCommentStore()
      const commentId = 'commentId'
      store.comments = [mockCommentDetailForTask]
      expect(store.comments[0].isDone).not.toEqual(true)
      await store.markCommentAsDone(commentId, true)
      expect(commentService.markCommentAsDone).toHaveBeenCalledWith(commentId, true)
      expect(store.comments[0].isDone).toEqual(true)
    })
  })

  describe('markAnswerAsDone', () => {
    it('should call the service to mark a comment answer as done', async () => {
      const store = useCommentStore()
      const commentId = 'commentId'
      const answerId = 'answerId'
      store.comments = [mockCommentDetailForTask]

      expect(store.comments[0].answers[0].isDone).not.toEqual(true)
      await store.markAnswerAsDone(commentId, answerId, true)
      expect(commentService.markAnswerAsDone).toHaveBeenCalledWith(commentId, answerId, true)
      expect(store.comments[0].answers[0].isDone).toEqual(true)
    })
  })

  describe('updateComment', () => {
    it('should call the service to update a comment', async () => {
      const store = useCommentStore()
      const commentId = 'commentId'
      store.comments = [mockCommentDetailForTask]

      await store.updateComment(commentId, mockCommentDetailForTask)
      expect(commentService.update).toHaveBeenCalledWith(commentId, mockCommentDetailForTask)
    })
  })

  describe('deleteComment', () => {
    it('should call the service to delete a comment', async () => {
      const store = useCommentStore()
      const commentId = 'commentId'
      store.comments = [mockCommentDetailForTask]

      await store.deleteComment(commentId)
      expect(commentService.delete).toHaveBeenCalledWith(commentId)
      expect(store.comments.length).toEqual(0)
    })
  })

  describe('getters', () => {
    it('should prepare commentObj', async () => {
      const store = useCommentStore()
      store.comments = [mockCommentDetailForTask]

      expect(store.commentsObj).toEqual({ [mockCommentDetailForTask.referenceObjectId]: [mockCommentDetailForTask] })
    })
  })
})
