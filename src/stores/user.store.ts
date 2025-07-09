import { UserService } from '@/services/user/user.service'
import type { IResearcherIdentity } from '@/types/proposal.types'
import type { IKeycloakUser, IUpdateUser } from '@/types/user.types'
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
    async getEmails(includeInvalidEmails?: boolean): Promise<string[]> {
      const query = includeInvalidEmails ? { includeInvalidEmails: true } : undefined
      const response = await this.apiService.getEmails(query)
      return response.emails
    },
    async getUserByEmail(email: string): Promise<IKeycloakUser | null> {
      if (!email) {
        return null
      }
      const user = await this.apiService.getUserByEmail(email)
      return user
    },
  },
})
