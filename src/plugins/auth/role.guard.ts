import type { Role } from '@/types/oidc.types'
import { RouteName } from '@/types/route-name.enum'
import { userHasPermission } from '@/utils/user.util'
import type { Router } from 'vue-router'

/**
 * Role Guard
 * Usage: Add the required roles to the routes meta.roles
 */
export const addRoleGuard = (router: Router) => {
  router.beforeEach((to, _from, next) => {
    const permittedRoles = (to.meta.roles as Role[]) || undefined
    if (userHasPermission(permittedRoles)) {
      next()
    } else {
      next({ name: RouteName.NoPermission })
    }
  })
}
