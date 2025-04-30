import { ConfigService } from '@/services/config/config.service'
import type { IDataPrivacyConfigGet } from '@/types/data-privacy.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSource } from '@/types/proposal.types'
import type { ITermsConfigGet } from '@/types/terms.types'
import { defineStore } from 'pinia'

export interface IConfigState {
  apiService: ConfigService
  termsAndConditions: Partial<Record<PlatformIdentifier, ITermsConfigGet>>
  dataPrivacy: Partial<Record<PlatformIdentifier, IDataPrivacyConfigGet>>
  dataSources: Record<PlatformIdentifier, IDataSource>
}

export const useConfigStore = defineStore('Config', {
  state: (): IConfigState => ({
    apiService: new ConfigService(),
    termsAndConditions: {},
    dataPrivacy: {},
    dataSources: {
      [PlatformIdentifier.Mii]: {
        title: '',
        description: '',
        externalLink: '',
      },
      [PlatformIdentifier.DIFE]: {
        title: '',
        description: '',
        externalLink: '',
      },
    },
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
    async getDataSources(): Promise<void> {
      const result = await this.apiService.getDataSources()
      this.dataSources = result as unknown as Record<PlatformIdentifier, IDataSource>
    },
  },
})
