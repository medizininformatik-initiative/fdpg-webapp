import { ApiClient } from '@/httpClients/api/api.client'
import { Role } from '@/types/oidc.types'
import type { IResearcherIdentity } from '@/types/proposal.types'
import type { ICreateUser, IUpdateUser, IUserEmailsResponse, IUserEmailsQuery, IKeycloakUser } from '@/types/user.types'

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
      receiveProposalEmails: true,
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
  async getEmails(query?: IUserEmailsQuery): Promise<IUserEmailsResponse> {
    const params = new URLSearchParams()
    if (query?.startsWith) {
      params.append('startsWith', query.startsWith)
    }

    const url = params.toString() ? `${this.basePath}/emails?${params.toString()}` : `${this.basePath}/emails`
    const response = await this.apiClient.get<IUserEmailsResponse>(url)
    return response.data
  }

  async getEmailsOnly(query?: IUserEmailsQuery): Promise<string[]> {
    const response = await this.getEmails(query)
    return response.emails
  }

  async searchEmailsByPrefix(prefix: string): Promise<IUserEmailsResponse> {
    if (!prefix || prefix.trim().length === 0) {
      throw new Error('Prefix must be at least 1 character')
    }
    return this.getEmails({ startsWith: prefix.trim() })
  }

  async getUserByEmail(email: string): Promise<IKeycloakUser> {
    const response = await this.apiClient.get<IKeycloakUser>(`${this.basePath}/by-email/${encodeURIComponent(email)}`)
    return response.data
  }
}
