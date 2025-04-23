import { ApiClient } from '@/httpClients/api/api.client'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { AxiosInstance } from 'axios'
import { ConfigService } from './config.service'
import type { MockedObject } from 'vitest'
import type { IDataSource } from '@/types/proposal.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/httpClients/api/api.client')

const mockGetAllResponse = {
  data: 'Hello World',
}

describe('ConfigService', () => {
  let service: ConfigService
  let apiClient: MockedObject<AxiosInstance>
  const basePath = '/config'

  beforeEach(() => {
    apiClient = new ApiClient().client as MockedObject<AxiosInstance>
    vi.clearAllMocks()
    service = new ConfigService()
  })

  describe('GetTermsAndConditions', () => {
    it('should call the api client to get the terms and conditions of the platform', async () => {
      apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
      const response = await service.getTermsAndConditions(PlatformIdentifier.Mii)
      expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${PlatformIdentifier.Mii}/terms`)
      expect(response).toEqual(mockGetAllResponse.data)
    })
  })

  it('should get data privacy', async () => {
    apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
    const response = await service.getDataPrivacy(PlatformIdentifier.Mii)
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/${PlatformIdentifier.Mii}/type-of-use-data-privacy`)
    expect(response).toEqual(mockGetAllResponse.data)
  })

  describe('GetDataSources', () => {
    it('should call the api client to get available data sources', async () => {
      apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
      const response = await service.getDataSources()
      expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/data-sources`)
      expect(response).toEqual(mockGetAllResponse.data)
    })
  })
})
