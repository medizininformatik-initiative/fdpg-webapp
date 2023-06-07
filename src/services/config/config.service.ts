import { ApiClient } from '@/httpClients/api/api.client'
import type { IDataPrivacyConfigGet } from '@/types/data-privacy.types'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITermsConfigGet } from '@/types/terms.types'

export class ConfigService {
  private basePath = '/config'
  private apiClient = new ApiClient().client

  async getTermsAndConditions(platform: PlatformIdentifier): Promise<ITermsConfigGet> {
    const response = await this.apiClient.get(`${this.basePath}/${platform}/terms`)
    return response.data
  }

  async getDataPrivacy(platform: PlatformIdentifier): Promise<IDataPrivacyConfigGet> {
    const response = await this.apiClient.get(`${this.basePath}/${platform}/type-of-use-data-privacy`)
    return response.data
  }
}
