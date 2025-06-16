import { FeasibilityService } from '@/services/feasibility/feasibility.service'
import type { IFeasibilityDetail } from '@/types/feasibility-detail.interface'
import { defineStore } from 'pinia'

export interface IFeasibilityState {
  apiService: FeasibilityService
  feasibilityQueries: IFeasibilityDetail[]
}

export const useFeasibilityStore = defineStore('Feasibility', {
  state: (): IFeasibilityState => ({
    apiService: new FeasibilityService(),
    feasibilityQueries: [],
  }),

  actions: {
    async getAll(): Promise<void> {
      this.feasibilityQueries = await this.apiService.getAll()
    },

    async getCsvByQueryId(id: number, queryName: string): Promise<void> {
      await this.apiService.getCsvByQueryId(id, queryName)
    },
  },
})
