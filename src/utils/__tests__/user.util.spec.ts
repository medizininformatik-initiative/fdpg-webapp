import { useAuthStore } from '@/stores/auth/auth.store'
import { userHasPermission } from '../user.util'
import { Role } from '@/types/oidc.types'

vi.mock('@/stores/auth/auth.store', () => ({
  useAuthStore: vi.fn().mockReturnValue({
    roles: [],
  }),
}))
describe('UserUtil', () => {
  const mockedAuthStore = vi.mocked(useAuthStore())

  it('should check if user has permission', () => {
    mockedAuthStore.roles = [Role.FdpgMember, Role.Admin]

    const permittedRolesSuccess = [Role.FdpgMember]
    const permittedRolesSuccess2 = [Role.Admin]
    const permittedRolesFail = [Role.Researcher]

    expect(userHasPermission(permittedRolesSuccess)).toBeTruthy()
    expect(userHasPermission(permittedRolesSuccess2)).toBeTruthy()
    expect(userHasPermission(permittedRolesFail)).toBeFalsy()
  })
})
