import { RouteName } from '@/types/route-name.enum'
import { getLastDashboardTitle } from '@/utils/breadcrumbs.util'

describe('breadcrumbs util', () => {
  const testCases: Array<[RouteName, string]> = [
    [RouteName.Dashboard, 'sidebar.dashboard'],
    [RouteName.Pending, 'general.pending'],
    [RouteName.Ongoing, 'general.current'],
    [RouteName.Completed, 'general.completed'],
    [RouteName.Archive, 'general.archive'],
    [RouteName.CreateProposal, 'sidebar.dashboard'],
  ]

  test.each(testCases)('should get the right dashboard title for %s', (routName, expectedResult) => {
    expect(getLastDashboardTitle(routName)).toBe(expectedResult)
  })
})
