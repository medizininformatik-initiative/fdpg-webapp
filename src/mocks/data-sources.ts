import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IDataSource } from '@/types/proposal.types'

// Add mock data sources after existing mocks
export const mockDataSources: IDataSource[] = [
  {
    _id: 'source1',
    tag: PlatformIdentifier.DIFE,
    title: 'proposal.dife_title',
    description: 'proposal.dife_description',
    externalLink: 'proposal.dife_link',
  },
  {
    _id: 'source2',
    tag: PlatformIdentifier.Mii,
    title: 'proposal.mii_title',
    description: 'proposal.mii_description',
    externalLink: 'proposal.mii_link',
  },
]
