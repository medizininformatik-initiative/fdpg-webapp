import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'

export function userHasPermission(permittedRoles: Role[]): boolean {
  const authStore = useAuthStore()
  const singleKnownRole = authStore.singleKnownRole

  return (
    !permittedRoles ||
    permittedRoles.length <= 0 ||
    permittedRoles.includes(singleKnownRole as NonNullable<typeof singleKnownRole>)
  )
}

export function transformKeycloakAttributesToDataSource(
  dataSourceString: string | undefined,
  singleKnownRole: Role | undefined,
): PlatformIdentifier[] {
  if (!singleKnownRole) {
    return []
  }
  const assignedDataSources: PlatformIdentifier[] = (dataSourceString?.split(';') ?? [])
    .map((raw) => raw.trim()) // strip whitespace
    .filter(Boolean) // drop empty tokens
    .map((token) => token.toUpperCase()) // normalize
    .map((upper) => {
      // find matching key…
      const key = (Object.keys(PlatformIdentifier) as Array<keyof typeof PlatformIdentifier>).find(
        (k) => k.toUpperCase() === upper,
      )
      return key ? PlatformIdentifier[key] : undefined // …and map to the enum value
    })
    .filter((val): val is PlatformIdentifier => Boolean(val)) // drop non-matches

  if (singleKnownRole === Role.FdpgMember && !assignedDataSources.includes(PlatformIdentifier.Mii)) {
    assignedDataSources.push(PlatformIdentifier.Mii)
  }

  return assignedDataSources
}
