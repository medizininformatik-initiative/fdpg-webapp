import { ApiClient } from '@/httpClients/api/api.client'
import { Role } from '@/types/oidc.types'
import type { IResearcherIdentity } from '@/types/proposal.types'
import type { ICreateUser, IUpdateUser } from '@/types/user.types'

export class UserService {
  private basePath = '/users'
  private apiClient = new ApiClient().client

  async create(user: IResearcherIdentity): Promise<void> {
    const createPayload: ICreateUser = {
      redirectUri: window.location.origin,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
      role: Role.Researcher,

      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }
    await this.apiClient.post(this.basePath, createPayload)
  }

  async updateProfile(userId: string, user: IUpdateUser): Promise<void> {
    await this.apiClient.put(`${this.basePath}/${userId}`, user)
  }

  async resendInvitation(email: string): Promise<void> {
    const resendPayload = {
      redirectUri: window.location.origin,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
      email,
    }

    await this.apiClient.patch(`${this.basePath}/resend-invitation`, resendPayload)
  }

  async resetPassword(userId: string): Promise<void> {
    const resendPayload = {
      redirectUri: `${window.location.origin}/profile`,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
    }

    await this.apiClient.put(`${this.basePath}/${userId}/password-reset`, resendPayload)
  }
}
