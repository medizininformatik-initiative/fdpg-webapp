import { UserService } from '@/services/user/user.service'
import type { Role } from '@/types/oidc.types'
import type { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IResearcherIdentity } from '@/types/proposal.types'
import type { IKeycloakUser, IUpdateUser, IUserEmailsResponse } from '@/types/user.types'
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
    async getEmails(): Promise<string[]> {
      const response = await this.apiService.getEmails()
      return response.emails
    },
    async getUserByEmail(email: string): Promise<IKeycloakUser | null> {
      if (!email) {
        return null
      }
      const user = await this.apiService.getUserByEmail(email)
      return user
    },
    async searchEmailsByPrefix(
      prefix: string,
      excludeEmails: string[] = [],
      roles: Role[] = [],
      dataSources: PlatformIdentifier[] = [],
    ): Promise<IUserEmailsResponse> {
      const data = await this.apiService.searchEmailsByPrefix(prefix, roles, dataSources)
      if (excludeEmails.length > 0) {
        const excludeSet = new Set(excludeEmails.map((email) => email.toLowerCase()))

        data.emails = data.emails.filter((email) => !excludeSet.has(email.toLowerCase()))
      }
      return data
    },
  },
})
