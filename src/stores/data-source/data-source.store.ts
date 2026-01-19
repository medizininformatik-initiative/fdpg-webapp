import { defineStore } from 'pinia'
import { DataSourceService } from '@/services/data-source/data-source.service'
import type {
  IDataSource,
  IDataSourcePaginatedResult,
  IDataSourceSearchParams,
  ISyncStatus,
  IUpdateStatusPayload,
  IUpdateActivePayload,
} from '@/types/data-source.types'

export interface IDataSourceState {
  apiService: DataSourceService
  currentPage: IDataSourcePaginatedResult | null
  syncStatus: ISyncStatus | null
}

export const useDataSourceStore = defineStore('DataSource', {
  state: (): IDataSourceState => ({
    apiService: new DataSourceService(),
    currentPage: null,
    syncStatus: null,
  }),

  actions: {
    async search(params: IDataSourceSearchParams): Promise<IDataSourcePaginatedResult> {
      const data = await this.apiService.search(params)
      return data
    },

    async searchOverview(params: IDataSourceSearchParams): Promise<IDataSourcePaginatedResult> {
      const data = await this.apiService.searchOverview(params)
      this.currentPage = data
      return data
    },

    async getById(id: string): Promise<IDataSource> {
      const data = await this.apiService.getById(id)
      return data
    },

    async getByNfdi4healthId(nfdi4healthId: string): Promise<IDataSource> {
      const data = await this.apiService.getByNfdi4healthId(nfdi4healthId)
      return data
    },

    async updateStatus(nfdi4healthId: string, payload: IUpdateStatusPayload): Promise<void> {
      await this.apiService.updateStatus(nfdi4healthId, payload)
      // Refresh current page if loaded
      if (this.currentPage) {
        const params: IDataSourceSearchParams = {
          page: this.currentPage.page,
          pageSize: this.currentPage.pageSize,
        }
        await this.searchOverview(params)
      }
    },

    async updateActive(externalIdentifier: string, payload: IUpdateActivePayload): Promise<void> {
      await this.apiService.updateActive(externalIdentifier, payload)
      // Refresh current page if loaded
      if (this.currentPage) {
        const params: IDataSourceSearchParams = {
          page: this.currentPage.page,
          pageSize: this.currentPage.pageSize,
        }
        await this.searchOverview(params)
      }
    },

    async triggerSync(): Promise<{ message: string; startedAt: Date }> {
      const data = await this.apiService.triggerSync()
      // Immediately fetch sync status
      await this.getSyncStatus()
      return data
    },

    async getSyncStatus(): Promise<ISyncStatus> {
      const data = await this.apiService.getSyncStatus()
      this.syncStatus = data
      return data
    },

    clearCurrentPage(): void {
      this.currentPage = null
    },
  },
})
