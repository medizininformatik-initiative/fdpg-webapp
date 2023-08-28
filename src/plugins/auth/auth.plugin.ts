import { LocationUtil } from '@/utils/location.util'
import { WebStorageStateStore } from 'oidc-client'
import type { App } from 'vue'
import { LogLevel, SignInType, createOidcAuth } from 'vue-oidc-client/vue3'
import type { Router } from 'vue-router'
import { addRoleGuard } from './role.guard'

export const initAuthPlugin = async (router: Router) => {
  const location = new LocationUtil()

  const mainOidc = createOidcAuth(
    'main',
    SignInType.Window,
    location.baseUrl,
    {
      authority: `${import.meta.env.VITE_KEYCLOAK_BASE_URL}/auth/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
      client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      response_type: 'code',
      scope: 'openid profile email roles',
      automaticSilentRenew: true,
      mergeClaims: true,
      loadUserInfo: true,
      monitorSession: false,
      userStore: new WebStorageStateStore({ store: localStorage }),
    },
    console,
    process.env.NODE_ENV === 'development' ? LogLevel.Warn : LogLevel.Error,
  )

  mainOidc.useRouter(router)
  addRoleGuard(router)

  const isOidcStartupOkay = await mainOidc.startup()

  if (!isOidcStartupOkay) {
    throw new Error('Init Auth failed')
  }

  const install = (app: App) => {
    app.config.globalProperties.$oidc = mainOidc
  }

  return {
    install,
    mainOidc,
  }
}
