import { ApiClient } from '@/httpClients/api/api.client'
import type { IFeasibilityDetail } from '@/types/feasibility-detail.interface'

export class FeasibilityService {
  private basePath = '/feasibilities'
  private apiClient = new ApiClient().client

  async getAll(): Promise<IFeasibilityDetail[]> {
    const response = await this.apiClient.get(this.basePath)
    return response.data
  }

  async getCsvByQueryId(id: number, queryName: String): Promise<void> {
    const response = await this.apiClient.get(`${this.basePath}/query/${id}/csv`, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))

    const a = document.createElement('a')
    a.href = url
    a.download = `${queryName}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
}
