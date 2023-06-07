import { UserService } from '@/services/user/user.service'
import { ApiClient } from '@/httpClients/api/api.client'
import type { AxiosInstance } from 'axios'
import { ParticipantType } from '@/types/proposal.types'
import { Role } from '@/types/oidc.types'
import type { ICreateUser } from '@/types/user.types'
import { Salutation } from '@/types/salutation.enum'
import type { MockedObject } from 'vitest'

vi.mock('@/httpClients/api/api.client')

describe('UserService', () => {
  let service: UserService
  let apiClient: MockedObject<AxiosInstance>
  const basePath = '/users'

  beforeEach(() => {
    apiClient = new ApiClient().client as MockedObject<AxiosInstance>
    vi.clearAllMocks()
    service = new UserService()
  })

  it('should create user', async () => {
    const user = {
      title: 'string',
      firstName: 'string',
      lastName: 'string',
      affiliation: 'string',
      email: 'string',
      isExisting: true,
      isEmailVerified: true,
      isRegistrationComplete: true,
      participantType: ParticipantType.AdditionalProjectLeader,
      username: 'string',
    }
    const createPayload = {
      redirectUri: window.location.origin,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
      role: Role.Researcher,

      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    } as ICreateUser
    await service.create(user)
    expect(apiClient.post).toHaveBeenCalledWith(`${basePath}`, createPayload)
  })

  it('should update profile', async () => {
    const user = {
      salutation: Salutation.Female,
      title: 'string',
      firstName: 'string',
      lastName: 'string',
      email: 'string',
      affiliation: 'string',
    }

    const userId = 'userId'
    await service.updateProfile(userId, user)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${userId}`, user)
  })

  it('should resend invitation', async () => {
    const email = 'email'
    const resendPayload = {
      redirectUri: window.location.origin,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
      email,
    }
    await service.resendInvitation(email)
    expect(apiClient.patch).toHaveBeenCalledWith(`${basePath}/resend-invitation`, resendPayload)
  })

  it('should reset password', async () => {
    const resendPayload = {
      redirectUri: `${window.location.origin}/profile`,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
    }
    const userId = 'userId'
    await service.resetPassword(userId)
    expect(apiClient.put).toHaveBeenCalledWith(`${basePath}/${userId}/password-reset`, resendPayload)
  })
})
