import { defineStore } from 'pinia'
import { LocationService } from '@/services/locations/location.service'
import type { ILocation, ILocationSyncChangelog } from '@/types/location.types'

export interface ILocationState {
  apiService: LocationService
}

export const useLocationStore = defineStore('Location', {
  state: (): ILocationState => ({
    apiService: new LocationService(),
  }),

  actions: {
    async getAll(): Promise<ILocation[]> {
      const data = await this.apiService.getAll()
      return data
    },

    async getAllChangelogs(): Promise<ILocationSyncChangelog[]> {
      const data = await this.apiService.getAllChangelogs()

      return data
    },
  },
})
