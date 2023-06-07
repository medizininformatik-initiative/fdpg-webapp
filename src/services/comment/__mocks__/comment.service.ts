export const mockGetAll = vi.fn()
export const mockCreate = vi.fn()
export const mockCreateAnswer = vi.fn()
export const mockUpdate = vi.fn()
export const mockMarkCommentAsDone = vi.fn()
export const mockMarkAnswerAsDone = vi.fn()
export const mockDelete = vi.fn()

export const CommentService = vi.fn().mockImplementation(() => ({
  getAll: mockGetAll,
  create: mockCreate,
  createAnswer: mockCreateAnswer,
  update: mockUpdate,
  markCommentAsDone: mockMarkCommentAsDone,
  markAnswerAsDone: mockMarkAnswerAsDone,
  delete: mockDelete,
}))
