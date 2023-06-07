import { ApiClient } from '@/httpClients/api/api.client'
import type { IFeasibilityDetail } from '@/types/feasibility-detail.interface'

export class FeasibilityService {
  private basePath = '/feasibilities'
  private apiClient = new ApiClient().client

  async getAll(): Promise<IFeasibilityDetail[]> {
    const response = await this.apiClient.get(this.basePath)
    return response.data
  }
}
