import { Role } from '@/types/oidc.types'

const mockLogIn = vi.fn()
const mockLogOut = vi.fn()

export const useAuthStore = vi.fn().mockImplementation(() => ({
  $oidc: {},

  //Actions
  logIn: mockLogIn,
  logOut: mockLogOut,

  //Getters
  profile: {},
  roles: {},
  singleKnownRole: Role.FdpgMember,
  isLoggedIn: true,
  token: 'accessToken',
}))
