const mockFetchAll = vi.fn()
const mockCreateComment = vi.fn()
const mockCreateAnswer = vi.fn()
const mockMarkCommentAsDone = vi.fn()
const mockMarkAnswerAsDone = vi.fn()
const mockUpdateComment = vi.fn()
const mockDeleteComment = vi.fn()
const mockComments = [] as any[]
const mockCommentsObject = {} as Record<string, any[]>

export const useCommentStore = vi.fn().mockImplementation(() => {
  return {
    comments: mockComments,

    //Actions
    fetchAll: mockFetchAll,
    createComment: mockCreateComment,
    createAnswer: mockCreateAnswer,
    markCommentAsDone: mockMarkCommentAsDone,
    markAnswerAsDone: mockMarkAnswerAsDone,
    updateComment: mockUpdateComment,
    deleteComment: mockDeleteComment,

    //Getters
    commentsObj: mockCommentsObject,
  }
})
