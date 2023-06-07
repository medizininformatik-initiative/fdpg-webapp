import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import { PanelQuery } from '@/types/sort-filter.types'
import type { ProjectFetchingType } from '@/types/proposal.types'
import { PanelQueryObj } from '@/constants'

export const getPanelQuery = (type: CardType, userRole: Role, fetchingType: ProjectFetchingType) => {
  if (type === CardType.Archive) {
    return PanelQuery.Archived
  }

  if (userRole === Role.FdpgMember) {
    if (type === CardType.Completed) {
      return PanelQueryObj[userRole][type]
    } else {
      return PanelQueryObj[userRole][type][fetchingType]
    }
  } else {
    return PanelQueryObj[userRole][type]
  }
}
