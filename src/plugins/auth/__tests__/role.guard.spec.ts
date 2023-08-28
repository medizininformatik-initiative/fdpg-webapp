import type { Router } from 'vue-router'
import { addRoleGuard } from '../role.guard'
import { userHasPermission } from '@/utils/user.util'

vi.mock('@/utils/user.util', () => ({
  userHasPermission: vi.fn(),
}))

describe('RoleGuard', () => {
  const userHasPermissionMock = vi.mocked(userHasPermission)

  it('should add the role guard', async () => {
    let beforeEachCallback

    const beforeEachMock = vi.fn().mockImplementation((callback) => {
      beforeEachCallback = callback
    })
    const router = { beforeEach: beforeEachMock } as any as Router

    addRoleGuard(router)

    expect(beforeEachMock).toBeCalledTimes(1)
  })

  test.each([true, false])('should check the permission (hasPermission: %s)', async (hasPermission: boolean) => {
    userHasPermissionMock.mockReturnValueOnce(hasPermission)
    let beforeEachCallback = (to: any, from: any, next: any) => {}

    const toMock = { meta: { roles: ['test'] } }
    const nextMock = vi.fn()
    const fromMock = {}

    const beforeEachMock = vi.fn().mockImplementation((callback) => {
      beforeEachCallback = callback
    })
    const router = { beforeEach: beforeEachMock } as any as Router

    addRoleGuard(router)

    beforeEachCallback(toMock, fromMock, nextMock)

    expect(userHasPermissionMock).toBeCalledWith(toMock.meta.roles)
    expect(nextMock).toBeCalledTimes(1)

    if (hasPermission) {
      expect(nextMock).toBeCalledWith()
    } else {
      expect(nextMock).toBeCalledWith({ name: 'NoPermission' })
    }
  })
})
