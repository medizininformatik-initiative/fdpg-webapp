import { PanelQueryObj } from '@/constants'
import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import { ProjectFetchingType } from '@/types/proposal.types'
import { PanelQuery } from '@/types/sort-filter.types'
import { getPanelQuery } from '@/utils/panelQuery.util'

describe('getPanelQuery', () => {
  describe('when userRole is FdpgMember', () => {
    const role = Role.FdpgMember
    describe('when type is Completed', () => {
      const type = CardType.Completed
      it('should return PanelQuery.FdpgFinished', () => {
        expect(getPanelQuery(type, role, ProjectFetchingType.TO_CHECK)).toBe(PanelQuery.FdpgFinished)
      })
    })

    describe.each([ProjectFetchingType.IN_WORK, ProjectFetchingType.TO_CHECK])(
      'when type is not Completed and fetching type is: %s',
      (fetchingType) => {
        test.each([CardType.Pending, CardType.Requested, CardType.Ongoing])(
          'should return the correct panel query when type is: %s',
          (type) => {
            const anyPanelQueryObj = PanelQueryObj as any
            expect(getPanelQuery(type, role, fetchingType)).toBe(anyPanelQueryObj[role][type][fetchingType])
          },
        )
      },
    )
  })

  describe.each([Role.DizMember, Role.UacMember, Role.Researcher, Role.Admin])(`when userRole is: %s`, (role) => {
    describe.each([CardType.Draft, CardType.Pending, CardType.Ongoing, CardType.Completed])(
      'when type is: %s',
      (type) => {
        it(`should return the correct panel query`, () => {
          if (role === Role.Admin) {
            expect(getPanelQuery(type, role, ProjectFetchingType.TO_CHECK)).toBe(PanelQuery.Archived)
          } else {
            const anyPanelQueryObj = PanelQueryObj as any
            const roleMap = anyPanelQueryObj[role]
            if (type in roleMap) {
              expect(getPanelQuery(type, role, ProjectFetchingType.TO_CHECK)).toBe(anyPanelQueryObj[role][type])
            } else {
              expect(getPanelQuery(type, role, ProjectFetchingType.TO_CHECK)).toBe(PanelQuery.Archived)
            }
          }
        })
      },
    )
  })
})
