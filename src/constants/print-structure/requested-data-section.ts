import type { IDefinitionCard, IDefinitionSectionSingle } from '@/components/Shared/definition-card.types'
import type { IProposal } from '@/types/proposal.types'

const requestedDataCard: IDefinitionCard<IProposal, 'requestedData'> = {
  key: 'requestedData',
  cardLabel: null,
  terms: [
    {
      label: 'proposal.patientInfo',
      size: 24,
      definitions: [[{ key: 'patientInfo' }]],
    },
    {
      label: 'proposal.informationOnDataSelection',
      size: 24,
      definitions: [[{ key: 'dataInfo' }]],
    },
    {
      label: 'proposal.informationOnDesiredDataAmount',
      size: 24,
      definitions: [[{ key: 'desiredDataAmount' }]],
    },
  ],
}

export const requestedDataSection: IDefinitionSectionSingle<IProposal, 'requestedData'> = {
  sectionLabel: 'proposal.informationOnTheRequestedData',
  kind: 'single',
  key: 'requestedData',
  card: requestedDataCard,
}
