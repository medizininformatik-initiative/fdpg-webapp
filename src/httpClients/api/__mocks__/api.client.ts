const mockGet = vi.fn().mockImplementation(() => Promise.resolve())
const mockPost = vi.fn().mockImplementation(() => Promise.resolve())
const mockPut = vi.fn().mockImplementation(() => Promise.resolve())
const mockPatch = vi.fn().mockImplementation(() => Promise.resolve())
const mockDelete = vi.fn().mockImplementation(() => Promise.resolve())

export const ApiClient = vi.fn().mockImplementation(() => ({
  client: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    patch: mockPatch,
    delete: mockDelete,
  },
}))
