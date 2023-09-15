import type { IFdpgOidcProfile } from '@/types/oidc.types'
import type { Role } from '@/types/oidc.types'
import { defineStore } from 'pinia'
export interface IAuthState {
  updatedProfile?: IFdpgOidcProfile
  singleKnownRole?: Role
  isChangeRoleDialogOpen: boolean
  redirectToDetailPageProposalId?: string
}

export const useAuthStore = defineStore('auth', {
  state: (): IAuthState => ({
    updatedProfile: undefined,
    singleKnownRole: localStorage.getItem('currentRole') as Role,
    isChangeRoleDialogOpen: false,
    redirectToDetailPageProposalId: undefined,
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

    setSelectedRole(role: Role) {
      this.singleKnownRole = role
      localStorage.setItem('currentRole', role)
    },
    openChangeRoleDialog(id: string) {
      this.redirectToDetailPageProposalId = id
      this.isChangeRoleDialogOpen = true
    },

    closeChangeRoleDialog() {
      this.isChangeRoleDialogOpen = false
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
    isLoggedIn: (state): boolean => state.$oidc?.isAuthenticated ?? false,
    token(state): string {
      return this.isLoggedIn ? state.$oidc?.accessToken ?? '' : ''
    },
  },
})
