const mockFetchAll = vi.fn()
const mockCreateComment = vi.fn()
const mockCreateAnswer = vi.fn()
const mockMarkCommentAsDone = vi.fn()
const mockMarkAnswerAsDone = vi.fn()
const mockUpdateComment = vi.fn()
const mockDeleteComment = vi.fn()

export const useCommentStore = vi.fn().mockImplementation(() => ({
  comments: [],

  //Actions
  fetchAll: mockFetchAll,
  createComment: mockCreateComment,
  createAnswer: mockCreateAnswer,
  markCommentAsDone: mockMarkCommentAsDone,
  markAnswerAsDone: mockMarkAnswerAsDone,
  updateComment: mockUpdateComment,
  deleteComment: mockDeleteComment,

  //Getters
  commentsObj: {},
}))
