import { useAuthStore } from '@/stores/auth/auth.store'
import type { Role } from '@/types/oidc.types'

export function userHasPermission(permittedRoles: Role[]): boolean {
  const authStore = useAuthStore()
  const userRoles: Role[] = authStore.roles

  return (
    !permittedRoles ||
    permittedRoles.length <= 0 ||
    userRoles.find((role) => permittedRoles.includes(role)) !== undefined
  )
}
