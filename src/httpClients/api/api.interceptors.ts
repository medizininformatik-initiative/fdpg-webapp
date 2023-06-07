import { useAuthStore } from '@/stores/auth/auth.store'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const requestInterceptor = {
  onFullfilled: (config: InternalAxiosRequestConfig<any>) => {
    const auth = useAuthStore()
    const token = auth.token
    if (token) {
      const authHeader = `Bearer ${token}`
      config.headers.set('Authorization', authHeader)
    }

    return Promise.resolve(config)
  },

  onRejected: (error: AxiosError) => Promise.reject(error),
}

const responseInterceptor = {
  onFullfilled: (response: AxiosResponse<any, any>) => response,
  onRejected: (error: AxiosError) => {
    const auth = useAuthStore()

    if (error.response?.status === 401 && auth.isLoggedIn) {
      auth.logOut()
    }

    return Promise.reject(error)
  },
}

export { requestInterceptor, responseInterceptor }
