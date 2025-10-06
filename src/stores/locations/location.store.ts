import { defineStore } from 'pinia'
import { LocationService } from '@/services/locations/location.service'
import type { ILocation, ILocationSyncChangelog } from '@/types/location.types'

export interface ILocationState {
  apiService: LocationService
  allLocations: ILocation[]
}

export const useLocationStore = defineStore('Location', {
  state: (): ILocationState => ({
    apiService: new LocationService(),
    allLocations: [],
  }),

  actions: {
    async getAll(): Promise<ILocation[]> {
      if ((this.allLocations?.length ?? 0) > 0) {
        return this.allLocations
      }

      const data = await this.apiService.getAll()

      if (data.length > 0) {
        this.allLocations = [...data]
      }

      return data
    },

    async getLocationLookupMap(): Promise<{
      [k: string]: ILocation
    }> {
      const all = await this.getAll()
      return Object.fromEntries(all.map((location) => [location._id, location]))
    },

    async getAllActive(): Promise<ILocation[]> {
      const all = await this.getAll()
      return all.filter((location) => !location.deprecated)
    },

    async getAllChangelogs(): Promise<ILocationSyncChangelog[]> {
      const data = await this.apiService.getAllChangelogs()
      return data
    },

    async setChangelogStatus(changelog: ILocationSyncChangelog): Promise<ILocationSyncChangelog> {
      const data = await this.apiService.setChangelogStatus(changelog)
      return data
    },
  },
})
