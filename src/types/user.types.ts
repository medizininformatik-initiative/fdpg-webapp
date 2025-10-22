import type { MiiLocation } from './location.enum'
import type { Role } from './oidc.types'
import type { Salutation } from './salutation.enum'

export interface ICreateUser {
  email: string
  username: string
  firstName: string
  lastName: string
  role?: Role
  location?: MiiLocation
  clientId: string
  redirectUri?: string
  receiveProposalEmails: boolean
}

export interface IUpdateUser {
  salutation: Salutation
  title?: string
  firstName: string
  lastName: string
  affiliation: string
  receiveProposalEmails: boolean
}

export interface IUserEmailsResponse {
  emails: string[]
  total: number
}

export interface IUserEmailsQuery {
  startsWith?: string
}

export interface IKeycloakUser {
  id: string
  username: string
  enabled: boolean
  emailVerified: boolean
  firstName: string
  lastName: string
  email: string
  attributes?: Record<string, any>
  requiredActions: string[]
  createdTimestamp: number
  totp: boolean
}
