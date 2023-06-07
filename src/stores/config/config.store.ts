import { ConfigService } from '@/services/config/config.service'
import type { IDataPrivacyConfigGet } from '@/types/data-privacy.types'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { ITermsConfigGet } from '@/types/terms.types'
import { defineStore } from 'pinia'

export interface IConfigState {
  apiService: ConfigService
  termsAndConditions: Partial<Record<PlatformIdentifier, ITermsConfigGet>>
  dataPrivacy: Partial<Record<PlatformIdentifier, IDataPrivacyConfigGet>>
}

export const useConfigStore = defineStore('Config', {
  state: (): IConfigState => ({
    apiService: new ConfigService(),
    termsAndConditions: {},
    dataPrivacy: {},
  }),

  actions: {
    async getTermsAndConditions(platform: PlatformIdentifier): Promise<void> {
      const data = await this.apiService.getTermsAndConditions(platform)
      this.termsAndConditions[platform] = data
    },

    async getDataPrivacy(platform: PlatformIdentifier): Promise<void> {
      const data = await this.apiService.getDataPrivacy(platform)
      this.dataPrivacy[platform] = data
    },
  },
})
