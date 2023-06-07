import type { MiiLocation } from './location.enum'
import type { Salutation } from './salutation.enum'

export interface IOidc {
  access_token: string
  expires_at: number
  id_token: string
  profile: IFdpgOidcProfile
  refresh_token: string
  scope: string
  session_state: string
  token_type: string
}

export interface IFdpgBaseUser {
  title?: string
  salutation: Salutation
  affiliation: string
}

export interface IUserFromMii extends IFdpgBaseUser {
  MII_LOCATION: MiiLocation
}

export interface IUserFromExternalOrganization extends IFdpgBaseUser {
  organization: IOrganization
}

export type FdpgUser = IUserFromMii | IUserFromExternalOrganization

export interface IOrganization {
  country: string
  city: string
  street: string
  postalCode: string
  houseNumber: string
  name: string
  email: string
}

export interface IOidcProfile {
  acr: string
  auth_time: 1646727968
  azp: string
  email: string
  email_verified: true
  family_name: string
  given_name: string
  jti: string
  name: string
  preferred_username: string
  realm_access: IOidcRealmAccess
  session_state: string
  sid: string
  sub: string
  typ: string
}

export type IFdpgOidcProfile = IOidcProfile & FdpgUser

export interface IOidcRealmAccess {
  roles: Role[]
}

export enum Role {
  Admin = 'Admin',
  FdpgMember = 'FdpgMember',
  Researcher = 'Researcher',
  DizMember = 'DizMember',
  UacMember = 'UacMember',
}
