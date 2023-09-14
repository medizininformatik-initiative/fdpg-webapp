import { NoErrorThrownError, getError } from '@/__test__/get-error'
import { proposalCountMock } from '@/mocks/proposal-counts.mock'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useProposalStore } from '@/stores/proposal/proposal.store'
import { createTestingPinia } from '@pinia/testing'
import type { AxiosRequestConfig, AxiosResponse, AxiosResponseHeaders, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { setActivePinia } from 'pinia'
import { requestInterceptor, responseInterceptor } from '../api.interceptors'
import type { MockedObject } from 'vitest'
describe('UsePanels', () => {
  let proposalStore: MockedObject<ReturnType<typeof useProposalStore>>

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createTestingPinia())
    proposalStore = vi.mocked(useProposalStore())
    proposalStore.counts = proposalCountMock
  })

  it('should add Authoriation to header', async () => {
    const token = 'token'
    const authStore = useAuthStore()
    ;(authStore.token as any) = token
    const setFunction = vi.fn()
    const requestConfig: InternalAxiosRequestConfig = {
      headers: {
        set: setFunction,
      },
    } as any
    await requestInterceptor.onFullfilled(requestConfig)
    expect(setFunction).toHaveBeenCalledWith('Authorization', `Bearer ${token}`)
  })

  it('should return a promise error on rejected request', async () => {
    const error = new AxiosError()
    await expect(requestInterceptor.onRejected(error)).rejects.toEqual(error)
  })

  it('should return response on response fulfilled', () => {
    const response = {
      data: 's',
      status: 200,
      statusText: 'string;',
      headers: {} as AxiosResponseHeaders,
      config: {} as AxiosRequestConfig,
    } as AxiosResponse
    const result = responseInterceptor.onFullfilled(response)
    expect(result).toEqual(response)
  })

  it('should log out in 401 error', async () => {
    const authStore = useAuthStore()
    ;(authStore.isLoggedIn as any) = true
    const axiosError = new AxiosError()
    axiosError.request = {
      responseURL: '',
    }
    axiosError.response = {
      data: 's',
      status: 401,
      statusText: 'string;',
      headers: {} as AxiosResponseHeaders,
      config: {} as AxiosRequestConfig,
    } as AxiosResponse

    const call = responseInterceptor.onRejected(axiosError)
    const error = await getError(async () => await call)

    expect(error).toBeDefined()
    expect(error).not.toBeInstanceOf(NoErrorThrownError)
    expect(error).toBeInstanceOf(AxiosError)
    expect(authStore.logOut).toHaveBeenCalledTimes(1)
  })
})
