import type { IDefinitionCard, IDefinitionSectionSingle } from '@/components/Shared/definition-card.types'
import type { IProposal } from '@/types/proposal.types'

const projectUserCard: IDefinitionCard<IProposal, 'projectUser'> = {
  key: 'projectUser',
  cardLabel: null,
  terms: [
    {
      label: 'proposal.projectUser',
      size: 24,
      definitions: [[{ key: 'projectUserType', prefix: 'proposal.projectUserType_', kind: 'translatable' }]],
    },
  ],
}

export const projectUserSection: IDefinitionSectionSingle<IProposal, 'projectUser'> = {
  sectionLabel: 'proposal.projectUser',
  kind: 'single',
  key: 'projectUser',
  card: projectUserCard,
}
