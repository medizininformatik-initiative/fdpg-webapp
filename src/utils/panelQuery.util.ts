import { CardType } from '@/types/component.types'
import { Role } from '@/types/oidc.types'
import { PanelQuery } from '@/types/sort-filter.types'
import type { ProjectFetchingType } from '@/types/proposal.types'
import { PanelQueryObj } from '@/constants'

const isExtendedFdpgCardType = (type: CardType): type is CardType.Pending | CardType.Requested | CardType.Ongoing => {
  return [CardType.Pending, CardType.Requested, CardType.Ongoing].includes(type)
}

export const getPanelQuery = (type: CardType, userRole: Role, fetchingType: ProjectFetchingType) => {
  if (userRole === Role.FdpgMember) {
    if (type === CardType.Completed) {
      return PanelQueryObj[userRole][type]
    } else if (isExtendedFdpgCardType(type)) {
      return PanelQueryObj[userRole][type][fetchingType]
    }
  } else if (userRole !== Role.Admin) {
    const roleMap = PanelQueryObj[userRole]
    if (type in roleMap) {
      const typedType = type as keyof typeof roleMap
      return roleMap[typedType]
    }
  }

  return PanelQuery.Archived
}
