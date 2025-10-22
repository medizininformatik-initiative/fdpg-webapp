import { UserService } from '@/services/user/user.service'
import { ApiClient } from '@/httpClients/api/api.client'
import type { AxiosInstance } from 'axios'
import { ParticipantType } from '@/types/proposal.types'
import { Role } from '@/types/oidc.types'
import type { ICreateUser, IUserEmailsResponse, IKeycloakUser } from '@/types/user.types'
import { Salutation } from '@/types/salutation.enum'
import { beforeEach, describe, expect, it, vi, type MockedObject } from 'vitest'

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
      receiveProposalEmails: true,
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
      receiveProposalEmails: true,
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

  it('should get emails without query parameters', async () => {
    const mockResponse: IUserEmailsResponse = {
      emails: ['user1@example.com', 'user2@example.com'],
      total: 2,
    }
    apiClient.get.mockResolvedValue({ data: mockResponse })

    const result = await service.getEmails()

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails`)
    expect(result).toEqual(mockResponse)
  })

  it('should get user by email', async () => {
    const email = 'test@example.com'
    const mockUser: IKeycloakUser = {
      id: '1',
      username: 'testuser',
      enabled: true,
      emailVerified: true,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      attributes: {},
      requiredActions: [],
      createdTimestamp: Date.now(),
      totp: false,
    }
    apiClient.get.mockResolvedValue({ data: mockUser })

    const result = await service.getUserByEmail(email)

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/by-email/${encodeURIComponent(email)}`)
    expect(result).toEqual(mockUser)
  })

  it('should encode email parameter correctly', async () => {
    const email = 'test+tag@example.com'
    const mockUser: IKeycloakUser = {
      id: '1',
      username: 'testuser',
      enabled: true,
      emailVerified: true,
      firstName: 'Test',
      lastName: 'User',
      email: 'test+tag@example.com',
      attributes: {},
      requiredActions: [],
      createdTimestamp: Date.now(),
      totp: false,
    }
    apiClient.get.mockResolvedValue({ data: mockUser })

    const result = await service.getUserByEmail(email)

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/by-email/${encodeURIComponent(email)}`)
    expect(result).toEqual(mockUser)
  })

  it('should get emails with startsWith parameter', async () => {
    const mockResponse: IUserEmailsResponse = {
      emails: ['test@example.com', 'testing@example.com'],
      total: 2,
    }
    apiClient.get.mockResolvedValue({ data: mockResponse })

    const result = await service.getEmails({ startsWith: 'tes' })

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails?startsWith=tes`)
    expect(result).toEqual(mockResponse)
  })

  it('should search emails by prefix', async () => {
    const mockResponse: IUserEmailsResponse = {
      emails: ['abc@example.com', 'abcd@example.com'],
      total: 2,
    }
    apiClient.get.mockResolvedValue({ data: mockResponse })

    const result = await service.searchEmailsByPrefix('abc')

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails?startsWith=abc`)
    expect(result).toEqual(mockResponse)
  })

  it('should throw error when prefix is empty', async () => {
    await expect(service.searchEmailsByPrefix('')).rejects.toThrow('Prefix must be at least 1 character')
  })

  it('should accept prefixes of different lengths', async () => {
    const mockResponse: IUserEmailsResponse = {
      emails: ['a@example.com', 'abcd@example.com'],
      total: 2,
    }
    apiClient.get.mockResolvedValue({ data: mockResponse })

    await service.searchEmailsByPrefix('a')
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails?startsWith=a`)

    await service.searchEmailsByPrefix('abcd')
    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails?startsWith=abcd`)
  })

  it('should handle query parameters correctly', async () => {
    const mockResponse: IUserEmailsResponse = {
      emails: ['test@example.com'],
      total: 1,
    }
    apiClient.get.mockResolvedValue({ data: mockResponse })

    const result = await service.getEmails({
      startsWith: 'tes',
    })

    expect(apiClient.get).toHaveBeenCalledWith(`${basePath}/emails?startsWith=tes`)
    expect(result).toEqual(mockResponse)
  })
})
