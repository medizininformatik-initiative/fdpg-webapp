import { useAuthStore } from '@/stores/auth/auth.store'
import { RouteName } from '@/types/route-name.enum'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Router from '../../router'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
const requestInterceptor = {
  onFullfilled: (config: InternalAxiosRequestConfig) => {
    const auth = useAuthStore()
    const token = auth.token
    if (token) {
      const authHeader = `Bearer ${token}`
      config.headers.set('Authorization', authHeader)
    }
    config.headers.set('x-selected-role', auth.singleKnownRole)

    return Promise.resolve(config)
  },

  onRejected: (error: AxiosError) => Promise.reject(error),
}

let isHandling401 = false
const responseInterceptor = {
  onFullfilled: (response: AxiosResponse) => response,
  onRejected: async (error: AxiosError) => {
    const auth = useAuthStore()
    const messageBoxStore = useMessageBoxStore()

    // Handle 500+ Internal Server Errors
    if (error.response?.status && error.response.status >= 500) {
      messageBoxStore.setMessageBoxInfo({
        cancelButtonText: 'general.cancel',
        cancelButtonClass: 'el-button--text',
        title: 'general.genericError',
        message: 'general.internalError',
        confirmButtonText: 'general.confirm',
        callback: async () => undefined,
        showCancelButton: false,
      })
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized - Session Expired
    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true
      messageBoxStore.setMessageBoxInfo({
        cancelButtonText: 'general.cancel',
        cancelButtonClass: 'el-button--text',
        title: 'general.genericError',
        message: 'general.expiredSession',
        confirmButtonText: 'general.confirm',
        callback: async () => {
          auth.logOut()
        },
        showCancelButton: false,
      })
      return Promise.reject(error)
    }

    const proposalId = extractIdFromPath(error.request?.responseURL)

    // Handle 403 Forbidden - Authentication/Role Problems
    if (error.response?.status === 403 && auth.isLoggedIn && proposalId) {
      await Router.push({ name: RouteName.Dashboard })
      if (auth.roles.length > 1) {
        auth.openChangeRoleDialog(proposalId)
      } else {
        messageBoxStore.setMessageBoxInfo({
          cancelButtonText: 'general.cancel',
          cancelButtonClass: 'el-button--text',
          title: 'roles.changeRoleModalTitle',
          message: 'roles.roleAccessDenied',
          confirmButtonText: 'general.confirm',
          callback: async () => undefined,
          showCancelButton: false,
        })
      }
      return Promise.resolve(undefined)
    }

    // Handle 403 Forbidden - Generic Auth Error (no roles assigned yet)
    if (error.response?.status === 403 && auth.isLoggedIn && !proposalId) {
      messageBoxStore.setMessageBoxInfo({
        cancelButtonText: 'general.cancel',
        cancelButtonClass: 'el-button--text',
        title: 'roles.changeRoleModalTitle',
        message: 'general.authError',
        confirmButtonText: 'general.confirm',
        callback: async () => undefined,
        showCancelButton: false,
      })
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
}

const extractIdFromPath = (path: string) => {
  const regex = /\/proposals\/(\w+)\/?$/
  const match = path.match(regex)
  return match ? match[1] : null
}
export { requestInterceptor, responseInterceptor }
