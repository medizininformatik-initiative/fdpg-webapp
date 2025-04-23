import { mockTermsAndConditions } from '@/mocks/terms-and-conditions.mock'
import { ConfigService } from '@/services/config/config.service'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { createPinia, setActivePinia } from 'pinia'
import { useConfigStore } from './config.store'
import type { IDataPrivacyConfigGet } from '@/types/data-privacy.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDataSources } from '@/mocks/data-sources'

vi.mock('@/services/config/config.service')

const configService = vi.mocked(new ConfigService())

describe('Config Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders', () => {
    const store = useConfigStore()
    expect(store).toBeTruthy()
  })

  describe('GetTermsAndConditions', () => {
    it('should call the service to get the terms and conditions of the platform', async () => {
      const store = useConfigStore()

      configService.getTermsAndConditions.mockResolvedValueOnce(mockTermsAndConditions)
      await store.getTermsAndConditions(PlatformIdentifier.Mii)
      expect(configService.getTermsAndConditions).toHaveBeenCalledWith(PlatformIdentifier.Mii)
      expect(store.termsAndConditions.MII).toEqual(mockTermsAndConditions)
    })
  })

  it('should get privacy settings', async () => {
    const store = useConfigStore()
    configService.getDataPrivacy.mockResolvedValueOnce({
      platform: PlatformIdentifier.Mii,
      updatedAt: 'string',
      createdAt: 'string',
      _id: 'string',
      message: '',
    } as unknown as IDataPrivacyConfigGet)
    await store.getDataPrivacy(PlatformIdentifier.Mii)
    expect(configService.getDataPrivacy).toHaveBeenCalledWith(PlatformIdentifier.Mii)
  })

  describe('GetDataSources', () => {
    it('should call the service to get available data sources', async () => {
      const store = useConfigStore()
      configService.getDataSources.mockResolvedValueOnce(mockDataSources)
      const result = await store.getDataSources()

      expect(configService.getDataSources).toHaveBeenCalled()
      expect(result).toEqual(mockDataSources)
      expect(result.length).toBe(2)
      expect(result[0].tag).toBe(PlatformIdentifier.DIFE)
      expect(result[1].tag).toBe(PlatformIdentifier.Mii)
    })
  })
})
