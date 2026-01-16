import { ApiClient } from '@/httpClients/api/api.client'
import type {
  IDataSource,
  IDataSourcePaginatedResult,
  IDataSourceSearchParams,
  ISyncStatus,
  IUpdateStatusPayload,
  IUpdateActivePayload,
} from '@/types/data-source.types'

export class DataSourceService {
  private basePath = '/data-sources'
  private apiClient = new ApiClient().client

  async search(params: IDataSourceSearchParams): Promise<IDataSourcePaginatedResult> {
    const response = await this.apiClient.get(`${this.basePath}/search`, { params })
    return response.data
  }

  async searchOverview(params: IDataSourceSearchParams): Promise<IDataSourcePaginatedResult> {
    const response = await this.apiClient.get(`${this.basePath}/overview/search`, { params })
    return response.data
  }

  async getById(id: string): Promise<IDataSource> {
    const response = await this.apiClient.get(`${this.basePath}/${id}`)
    return response.data
  }

  async getByNfdi4healthId(nfdi4healthId: string): Promise<IDataSource> {
    const response = await this.apiClient.get(`${this.basePath}/nfdi4health/${nfdi4healthId}`)
    return response.data
  }

  async updateStatus(nfdi4healthId: string, payload: IUpdateStatusPayload): Promise<void> {
    await this.apiClient.patch(`${this.basePath}/${nfdi4healthId}/status`, payload)
  }

  async updateActive(nfdi4healthId: string, payload: IUpdateActivePayload): Promise<void> {
    await this.apiClient.patch(`${this.basePath}/${nfdi4healthId}/active`, payload)
  }

  async triggerSync(): Promise<{ message: string; startedAt: Date }> {
    const response = await this.apiClient.post(`${this.basePath}/sync`)
    return response.data
  }

  async getSyncStatus(): Promise<ISyncStatus> {
    const response = await this.apiClient.get(`${this.basePath}/sync/status`)
    return response.data
  }

  async catch(error: any) {
    if (error.response) {
      const status = error.response.status
      let errorData = error.response.data
      if (errorData instanceof Blob) {
        try {
          const text = await errorData.text()
          errorData = JSON.parse(text)
        } catch (parseError) {
          console.warn('Could not parse error response as JSON:', parseError)
        }
      }
      const errorMessage = errorData?.message || errorData?.error || `Request failed with status ${status}`
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || 'An unexpected error occurred')
    }
  }
}
