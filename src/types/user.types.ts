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
}

export interface IUpdateUser {
  salutation: Salutation
  title?: string
  firstName: string
  lastName: string
  affiliation: string
}
