import type { IBreadcrumb } from '@/types/breadcrumb.interface'
import { RouteName } from '@/types/route-name.enum'
import { defineStore } from 'pinia'

interface ILayoutStore {
  breadcrumbs: IBreadcrumb[]
  isSidebarVisible: boolean
  lastDashboard: RouteName
}

export const useLayoutStore = defineStore('layout', {
  state: (): ILayoutStore => ({
    breadcrumbs: [],
    isSidebarVisible: false,
    lastDashboard: RouteName.Dashboard,
  }),

  actions: {
    setBreadcrumbs(breadcrumbs: IBreadcrumb[]) {
      this.breadcrumbs = breadcrumbs
    },

    setSidebarVisiblity(isVisible: boolean) {
      this.isSidebarVisible = isVisible
    },

    setLastDashboard(lastDashboard: RouteName) {
      this.lastDashboard = lastDashboard
    },
  },
})
