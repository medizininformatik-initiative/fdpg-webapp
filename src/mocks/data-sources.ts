import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSourceDto } from '@/types/proposal.types'

// Add mock data sources after existing mocks
export const mockDataSources: IDataSourceDto = {
  [PlatformIdentifier.DIFE]: {
    title: 'proposal.dife_title',
    description: 'proposal.dife_description',
    externalLink: 'proposal.dife_link',
  },
  [PlatformIdentifier.Mii]: {
    title: 'proposal.mii_title',
    description: 'proposal.mii_description',
    externalLink: 'proposal.mii_link',
  },
}
