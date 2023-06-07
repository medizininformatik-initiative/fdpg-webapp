import { ApiClient } from '@/httpClients/api/api.client'
import type { AxiosInstance } from 'axios'
import { FeasibilityService } from './feasibility.service'
import type { MockedObject } from 'vitest'

vi.mock('@/httpClients/api/api.client')

const mockGetAllResponse = {
  data: 'Hello World',
}

describe('FeasibilityService', () => {
  let service: FeasibilityService
  let apiClient: MockedObject<AxiosInstance>
  const basePath = '/feasibilities'

  beforeEach(() => {
    apiClient = new ApiClient().client as MockedObject<AxiosInstance>
    vi.clearAllMocks()
    service = new FeasibilityService()
  })

  describe('GetAll', () => {
    it('should call the api client to get all feasibility queries of the user', async () => {
      apiClient.get.mockResolvedValueOnce(mockGetAllResponse)
      const response = await service.getAll()
      expect(apiClient.get).toHaveBeenCalledWith(`${basePath}`)
      expect(response).toEqual(mockGetAllResponse.data)
    })
  })
})
