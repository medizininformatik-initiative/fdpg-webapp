export const mockGetAll = vi.fn()

export const FeasibilityService = vi.fn().mockImplementation(() => ({
  getAll: mockGetAll,
}))
