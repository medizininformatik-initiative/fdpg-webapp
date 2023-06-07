import { UserService } from '@/services/user/user.service'
import type { IResearcherIdentity } from '@/types/proposal.types'
import type { IUpdateUser } from '@/types/user.types'
import { defineStore } from 'pinia'

export interface IUserState {
  apiService: UserService
}

export const useUserStore = defineStore('User', {
  state: (): IUserState => ({
    apiService: new UserService(),
  }),

  actions: {
    async create(user: IResearcherIdentity): Promise<void> {
      await this.apiService.create(user)
    },
    async updateProfile(userId: string, user: IUpdateUser): Promise<void> {
      await this.apiService.updateProfile(userId, user)
    },

    async resendInvitation(email: string): Promise<void> {
      await this.apiService.resendInvitation(email)
    },

    async resetPassword(userId: string): Promise<void> {
      await this.apiService.resetPassword(userId)
    },
  },
})
