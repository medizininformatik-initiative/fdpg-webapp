import { vi } from 'vitest'

export const mockGetTermsAndConditions = vi.fn()
export const mockGetDataPrivacy = vi.fn()
export const mockGetDataSources = vi.fn()
export const ConfigService = vi.fn().mockImplementation(() => ({
  getTermsAndConditions: mockGetTermsAndConditions,
  getDataPrivacy: mockGetDataPrivacy,
  getDataSources: mockGetDataSources,
}))
