import { useAuthStore } from '@/stores/auth/auth.store'
import { Role } from '@/types/oidc.types'
import { userHasPermission } from '@/utils/user.util'
import { createTestingPinia } from '@pinia/testing'

describe('userHasPermission util', () => {
  createTestingPinia()
  const mockedAuthStore = vi.mocked(useAuthStore())
  const testCases = [
    {
      permittedRoles: [Role.FdpgMember],
      expected: true,
      authStoreRoles: Role.FdpgMember,
    },
    {
      permittedRoles: [Role.FdpgMember],
      expected: false,
      authStoreRoles: Role.DizMember,
    },
    {
      permittedRoles: [Role.FdpgMember, Role.DizMember],
      expected: true,
      authStoreRoles: Role.FdpgMember,
    },
    {
      permittedRoles: [Role.FdpgMember, Role.DizMember],
      expected: true,
      authStoreRoles: Role.DizMember,
    },
    {
      permittedRoles: [Role.FdpgMember, Role.DizMember],
      expected: false,
      authStoreRoles: Role.Researcher,
    },
    {
      permittedRoles: [Role.FdpgMember, Role.DizMember],
      expected: false,
      authStoreRoles: Role.Researcher,
    },
  ]

  test.each(testCases)('when give permission as expected', (testCase) => {
    mockedAuthStore.singleKnownRole = testCase.authStoreRoles
    expect(userHasPermission(testCase.permittedRoles)).toBe(testCase.expected)
  })
})
