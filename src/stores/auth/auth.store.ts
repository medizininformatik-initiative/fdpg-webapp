import type { IFdpgOidcProfile} from '@/types/oidc.types';
import { Role } from '@/types/oidc.types'
import { defineStore } from 'pinia'
export interface IAuthState {
  updatedProfile?: IFdpgOidcProfile
}

export const useAuthStore = defineStore('auth', {
  state: (): IAuthState => ({
    updatedProfile: undefined,
  }),

  actions: {
    logIn() {
      this.$oidc.signIn()
    },

    logOut() {
      this.$oidc.stopSilentRenew()
      this.$oidc.signOut()
    },

    setProfileUpdate(profile: IFdpgOidcProfile) {
      this.updatedProfile = profile
    },

    async loadProfile() {
      const signInData = await this.$oidc.mgr.signinSilent()

      const userManagerSettings = this.$oidc.mgr.settings

      // That's the only way I found to call the userInfo endpoint again
      const userInfoService = (userManagerSettings as any)?.validator?._userInfoService
      if (userInfoService) {
        const claims = await userInfoService.getClaims(signInData.access_token)

        signInData.profile = {
          ...signInData.profile,
          ...claims,
        }
        // Even though the user is stored here, it will not update on its own.
        // Check App.vue where this event is consumed to update the profile
        await this.$oidc.mgr.storeUser(signInData)
        this.$oidc.mgr.events.load(signInData)
      }
    },
  },

  getters: {
    profile: (state) => state.updatedProfile || state.$oidc?.user?.profile,
    roles: (state): Role[] => state.$oidc?.user?.profile.realm_access?.roles ?? [],
    singleKnownRole(): Role | undefined {
      if (this.roles.includes(Role.FdpgMember)) {
        return Role.FdpgMember
      }
      if (this.roles.includes(Role.UacMember)) {
        return Role.UacMember
      }
      if (this.roles.includes(Role.DizMember)) {
        return Role.DizMember
      }
      if (this.roles.includes(Role.Researcher)) {
        return Role.Researcher
      }

      return undefined
    },

    isLoggedIn: (state): boolean => state.$oidc?.isAuthenticated ?? false,

    token(state): string {
      return this.isLoggedIn ? state.$oidc?.accessToken ?? '' : ''
    },
  },
})
