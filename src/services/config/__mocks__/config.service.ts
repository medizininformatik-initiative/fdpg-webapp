export const mockGetTermsAndConditions = vi.fn()
export const mockGetDataPrivacy = vi.fn()
export const ConfigService = vi.fn().mockImplementation(() => ({
  getTermsAndConditions: mockGetTermsAndConditions,
  getDataPrivacy: mockGetDataPrivacy,
}))
