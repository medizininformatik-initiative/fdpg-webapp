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
    mockedAuthStore.singleKnownRole = Role.FdpgMember

    const permittedRolesSuccess = [Role.FdpgMember]
    const permittedRolesFail = [Role.Researcher]

    expect(userHasPermission(permittedRolesSuccess)).toBeTruthy()
    expect(userHasPermission(permittedRolesFail)).toBeFalsy()
  })
})
