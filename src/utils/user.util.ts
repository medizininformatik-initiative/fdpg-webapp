import { useAuthStore } from '@/stores/auth/auth.store'
import type { Role } from '@/types/oidc.types'

export function userHasPermission(permittedRoles: Role[]): boolean {
  const authStore = useAuthStore()
  const singleKnownRole = authStore.singleKnownRole

  return (
    !permittedRoles ||
    permittedRoles.length <= 0 ||
    permittedRoles.includes(singleKnownRole as NonNullable<typeof singleKnownRole>)
  )
}
