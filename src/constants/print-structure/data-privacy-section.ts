import type {
  IDefinitionCardArrayVirtual,
  IDefinitionSectionObjectVirtual,
  IVirtualWrap,
} from '@/components/Shared/definition-card.types'
import type { DataPrivacyTextsContentKeys } from '@/types/data-privacy.types'

export interface IDataPrivacyOverview {
  data?: DataPrivacyTextsContentKeys[]
}

const privacyByUsageCard: IDefinitionCardArrayVirtual<IVirtualWrap<IDataPrivacyOverview>, 'content', 'data'> = {
  key: 'content',
  cardLabel: 'proposal.typeOfUse_dataPrivacy',
  loopOn: 'data',
  terms: [
    {
      label: 'proposal.typeOfUse',
      size: 24,
      definitions: [[{ key: 'headline' }]],
    },
    {
      label: 'proposal.dataPrivacy',
      size: 24,
      definitions: [[{ key: 'text' }]],
    },
  ],
}

export const dataPrivacySection: IDefinitionSectionObjectVirtual<IVirtualWrap<IDataPrivacyOverview>, 'content'> = {
  sectionLabel: 'proposal.dataPrivacy',
  kind: 'object',
  key: 'content',
  mapping: [privacyByUsageCard],
}
