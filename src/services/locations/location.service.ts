import { ApiClient } from '@/httpClients/api/api.client'
import type { ILocation, ILocationSyncChangelog } from '@/types/location.types'

export class LocationService {
  private basePath = '/locations'
  private apiClient = new ApiClient().client

  async update(location: ILocation): Promise<ILocation> {
    const response = await this.apiClient.post(`${this.basePath}/${location._id}`, location)
    return response.data
  }

  async get(id: string): Promise<ILocation> {
    const response = await this.apiClient.get(`${this.basePath}/${id}`)
    return response.data
  }

  async getAll(): Promise<ILocation[]> {
    const response = await this.apiClient.get(this.basePath)

    return response.data
  }

  async getAllChangelogs(): Promise<ILocationSyncChangelog[]> {
    const response = await this.apiClient.get(`${this.basePath}/changelogs`)

    return response.data
  }

  async updateLocation(location: ILocation): Promise<ILocation> {
    const response = await this.apiClient.post(`${this.basePath}/${location._id}`, location)
    return response.data
  }

  async setChangelogStatus(changelog: ILocationSyncChangelog): Promise<ILocationSyncChangelog> {
    const response = await this.apiClient.post(`${this.basePath}/changelogs/${changelog._id}/status`, changelog)
    return response.data
  }

  async syncLocations(): Promise<ILocationSyncChangelog[]> {
    const response = await this.apiClient.get(`${this.basePath}/sync`)
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
      const errorMessage = errorData?.message || errorData?.error || `Export failed with status ${status}`
      throw new Error(errorMessage)
    } else {
      throw new Error(error.message || 'An unexpected error occurred while exporting files')
    }
  }
}
