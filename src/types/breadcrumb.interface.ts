import type { RouteParams } from 'vue-router'
import type { RouteName } from './route-name.enum'

export interface IBreadcrumb {
  name: RouteName
  displayName?: string
  params?: RouteParams
}
