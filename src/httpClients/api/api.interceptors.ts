import { useAuthStore } from '@/stores/auth/auth.store'
import { RouteName } from '@/types/route-name.enum'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import Router from '../../router'
import { useMessageBoxStore, type DecisionType } from '@/stores/messageBox.store'
const requestInterceptor = {
  onFullfilled: (config: InternalAxiosRequestConfig<any>) => {
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
  onFullfilled: (response: AxiosResponse<any, any>) => response,
  onRejected: async (error: AxiosError) => {
    const auth = useAuthStore()

    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true
      auth.logOut()
    }

    const proposalId = extractIdFromPath(error.request?.responseURL)
    const messageBoxStore = useMessageBoxStore()

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
    return Promise.reject(error)
  },
}

const extractIdFromPath = (path: string) => {
  const regex = /\/proposals\/(\w+)\/?$/
  const match = path.match(regex)
  return match ? match[1] : null
}
export { requestInterceptor, responseInterceptor }
