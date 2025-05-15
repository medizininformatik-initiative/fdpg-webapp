import { ApiClient } from '@/httpClients/api/api.client'
import type { IDataPrivacyConfigGet } from '@/types/data-privacy.types'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSource } from '@/types/proposal.types'
import type { ITermsConfigGet } from '@/types/terms.types'

export class ConfigService {
  private basePath = '/config'
  private apiClient = new ApiClient().client

  async getTermsAndConditions(platform: PlatformIdentifier): Promise<ITermsConfigGet> {
    const response = await this.apiClient.get(`${this.basePath}/${platform}/terms`)
    return response.data
  }

  async getDataPrivacy(platform: PlatformIdentifier | PlatformIdentifier[]): Promise<IDataPrivacyConfigGet> {
    const platforms = Array.isArray(platform) ? platform.join(',') : platform
    const response = await this.apiClient.get(`${this.basePath}/${platforms}/type-of-use-data-privacy`)
    return response.data
  }

  async getDataSources(): Promise<IDataSource[]> {
    const response = await this.apiClient.get(`${this.basePath}/data-sources`)
    return response.data
  }
}
