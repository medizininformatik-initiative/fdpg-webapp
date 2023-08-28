import { createOidcAuth, type OidcAuth } from 'vue-oidc-client/vue3'
import type { Router } from 'vue-router'
import { initAuthPlugin } from '../auth.plugin'
import { addRoleGuard } from '../role.guard'

vi.mock('@/utils/location.util', () => ({
  LocationUtil: vi.fn().mockReturnValue({
    baseUrl: 'http://test.de',
  }),
}))

vi.mock('@/plugins/auth/role.guard', () => ({
  addRoleGuard: vi.fn(),
}))

vi.mock('vue-oidc-client/vue3', () => ({
  SignInType: { Window: 'Window' },
  LogLevel: { Warn: 'Warn', Error: 'Error' },
  createOidcAuth: vi.fn(),
}))

describe('AuthPlugin', () => {
  const createOidcAuthMock = vi.mocked(createOidcAuth)

  it('should init auth plugin', async () => {
    const useRouterMock = vi.fn()
    const startupMock = vi.fn().mockResolvedValue(true)

    createOidcAuthMock.mockReturnValue({
      useRouter: useRouterMock,
      startup: startupMock,
    } as any as OidcAuth)

    const router = { test: 'router' } as any as Router

    const { install, mainOidc } = await initAuthPlugin(router)

    expect(install).toBeDefined()
    expect(mainOidc).toBeDefined()
    expect(useRouterMock).toHaveBeenCalledWith(router)
    expect(startupMock).toHaveBeenCalled()
    expect(addRoleGuard).toHaveBeenCalledWith(router)
  })

  it('should create oidc auth', async () => {
    const useRouterMock = vi.fn()
    const startupMock = vi.fn().mockResolvedValue(true)

    createOidcAuthMock.mockReturnValue({
      useRouter: useRouterMock,
      startup: startupMock,
    } as any as OidcAuth)

    const router = { test: 'router' } as any as Router

    await initAuthPlugin(router)

    expect(createOidcAuthMock).toBeCalledWith(
      'main',
      'Window',
      'http://test.de',
      {
        authority: `${import.meta.env.VITE_KEYCLOAK_BASE_URL}/auth/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`,
        client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
        response_type: 'code',
        scope: 'openid profile email roles',
        automaticSilentRenew: true,
        mergeClaims: true,
        loadUserInfo: true,
        monitorSession: false,
        userStore: expect.anything(),
      },
      console,
      'Error',
    )
  })

  it('should install oidc as global property', async () => {
    const useRouterMock = vi.fn()
    const startupMock = vi.fn().mockResolvedValue(true)

    createOidcAuthMock.mockReturnValue({
      useRouter: useRouterMock,
      startup: startupMock,
    } as any as OidcAuth)

    const router = { test: 'router' } as any as Router

    const { install } = await initAuthPlugin(router)

    const app = {
      config: {
        globalProperties: {
          $oidc: null,
        },
      },
    } as any

    install(app)

    expect(app.config.globalProperties.$oidc).toBeDefined()
  })

  it('should throw error if startup fails', async () => {
    const useRouterMock = vi.fn()
    const startupMock = vi.fn().mockResolvedValue(false)

    createOidcAuthMock.mockReturnValue({
      useRouter: useRouterMock,
      startup: startupMock,
    } as any as OidcAuth)

    const router = { test: 'router' } as any as Router

    await expect(initAuthPlugin(router)).rejects.toThrowError('Init Auth failed')
  })
})
