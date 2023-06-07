import type { MessageSchema } from '@/plugins/i18n'
import type { NestedPath } from '@/types/nested-key-of.type'
import type { RouteName } from '@/types/route-name.enum'

export enum MenuType {
  Route = 'Route',
  Url = 'Url',
}
export interface SidebarRouteMenu {
  kind: MenuType.Route
  to: RouteName
  title: NestedPath<MessageSchema>
  icon?: string
}

export interface SidebarUrlMenu {
  kind: MenuType.Url
  title: NestedPath<MessageSchema>
  url: string
  icon?: string
}

export type SidebarMenu = SidebarRouteMenu | SidebarUrlMenu
