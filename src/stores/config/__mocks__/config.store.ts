import { vi } from 'vitest'

const mockGetTermsAndConditions = vi.fn()

export const useCommentStore = vi.fn().mockImplementation(() => ({
  termsAndConditions: {},

  //Actions
  getTermsAndConditions: mockGetTermsAndConditions,
}))
