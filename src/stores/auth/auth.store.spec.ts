import type { App } from 'vue'
import { createApp } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth.store'
import type { OidcAuth } from 'vue-oidc-client/vue3'
import type { IFdpgOidcProfile } from '@/types/oidc.types'
import { Role } from '@/types/oidc.types'

describe('Auth Store', () => {
  let app: App
  const mockOidc = {
    signIn: vi.fn(),
    signOut: vi.fn(),
    stopSilentRenew: vi.fn(),
    userProfile: {},
    isAuthenticated: false,
    accessToken: '',
    mgr: {
      storeUser: vi.fn(),
      signinSilent: vi.fn().mockReturnValue({ access_token: 'test' }),
      settings: {
        validator: {
          _userInfoService: {
            getClaims: vi.fn(),
          },
        },
      },
      events: {
        load: vi.fn(),
      },
    },
    user: {
      profile: {
        realm_access: {
          roles: [Role.Admin],
        },
      },
    },
  }

  beforeEach(() => {
    app = createApp({})
    vi.spyOn(mockOidc, 'signIn').mockImplementation()
    vi.spyOn(mockOidc, 'signOut').mockImplementation()

    const pinia = createPinia().use(() => ({ $oidc: mockOidc as unknown as OidcAuth }))
    app.use(pinia)
    setActivePinia(pinia)
  })

  it('creates', () => {
    const store = useAuthStore()
    expect(store).toBeTruthy()
  })

  describe('Actions', () => {
    it('should call the oidc signOut method on logOut', () => {
      const store = useAuthStore()
      store.logOut()
      expect(mockOidc.signOut).toHaveBeenCalledTimes(1)
      expect(mockOidc.stopSilentRenew).toHaveBeenCalledTimes(1)
    })

    it('should call the oidc signIn method on logIn', () => {
      const store = useAuthStore()
      store.logIn()
      expect(mockOidc.signIn).toHaveBeenCalledTimes(1)
    })
  })

  it('should setProfileUpdate', () => {
    const store = useAuthStore()
    const profile = {
      acr: 'string',
      auth_time: 1646727968,
      azp: 'string',
      email: 'string',
      email_verified: true,
      family_name: 'string',
      given_name: 'string',
      jti: 'string',
      name: 'string',
      preferred_username: 'string',
      realm_access: { roles: [Role.Admin] },
      session_state: 'string',
      sid: 'string',
      sub: 'string',
      typ: 'string',
    } as IFdpgOidcProfile
    store.setProfileUpdate(profile)
    expect(store.updatedProfile).toEqual(profile)
  })

  it('should loadProfile', async () => {
    const store = useAuthStore()
    await store.loadProfile()
    expect(mockOidc.mgr.signinSilent).toHaveBeenCalledTimes(1)
    expect(mockOidc.mgr.settings.validator._userInfoService.getClaims).toHaveBeenCalledTimes(1)
    expect(mockOidc.mgr.storeUser).toHaveBeenCalledTimes(1)
  })

  describe('Getters', () => {
    test.each([true, false])('should proxy the isAuthenticated state to isLoggedIn state', (isAuthenticated) => {
      mockOidc.isAuthenticated = isAuthenticated
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(isAuthenticated)
    })

    it('should proxy the user profile', () => {
      mockOidc.user.profile = { realm_access: { roles: [Role.DizMember] } }
      const store = useAuthStore()
      expect(store.profile).toEqual({ realm_access: { roles: [Role.DizMember] } })
    })

    it('should have roles value getter', () => {
      const store = useAuthStore()
      expect(store.roles).toEqual([Role.DizMember])
    })

    it('should change singleKnownRole', () => {
      const store = useAuthStore()
      store.setSelectedRole(Role.DizMember)
      expect(store.singleKnownRole).toEqual(Role.DizMember)
    })

    it('should check token value getter', () => {
      const store = useAuthStore()
      expect(store.token).toEqual('')
    })
  })
})
