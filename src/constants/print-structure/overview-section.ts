import type {
  IDefinitionCardArrayVirtual,
  IDefinitionCardVirtual,
  IDefinitionSectionObjectVirtual,
  IVirtualWrap,
} from '@/components/Shared/definition-card.types'
import type { IUpload } from '@/types/proposal.types'

export interface IOverview {
  ownerId: string
  submittedAt: string
  projectAbbreviation: string
  proposalId: string
  uploads?: IUpload[]
  fdpgCheckNotes?: string
}

const overviewProjectCard: IDefinitionCardVirtual<IVirtualWrap<IOverview>, 'content'> = {
  kind: 'virtual',
  key: 'content',
  cardLabel: 'general.proposal',
  terms: [
    {
      label: 'proposal.projectAbbreviation',
      size: 12,
      definitions: [[{ key: 'projectAbbreviation' }]],
    },
    {
      label: 'proposal.submittedAt',
      size: 12,
      definitions: [[{ key: 'submittedAt', kind: 'date' }]],
    },
    {
      label: 'proposal.proposalId',
      size: 12,
      definitions: [[{ key: 'proposalId' }]],
    },
    {
      label: 'general.applicantId',
      size: 12,
      definitions: [[{ key: 'ownerId' }]],
    },
  ],
}

const fdpgCheckNoteCard: IDefinitionCardVirtual<IVirtualWrap<IOverview>, 'content'> = {
  kind: 'virtual',
  key: 'content',
  cardLabel: 'general.additionalInformation',
  terms: [
    {
      label: 'proposal.fdpgCheckNotes',
      size: 24,
      definitions: [[{ key: 'fdpgCheckNotes' }]],
    },
  ],
}

const overviewAppendixCard: IDefinitionCardArrayVirtual<IVirtualWrap<IOverview>, 'content', 'uploads'> = {
  key: 'content',
  cardLabel: 'proposal.appendix',
  loopOn: 'uploads',
  terms: [
    {
      label: 'proposal.type',
      size: 24,
      definitions: [[{ key: 'type', kind: 'translatable', prefix: 'proposal.uploadType_' }]],
    },
    {
      label: 'general.fileName',
      size: 24,
      definitions: [[{ key: 'fileName' }]],
    },
    {
      label: 'proposal.appendixId',
      size: 24,
      definitions: [[{ key: '_id' }]],
    },
  ],
}

export const overviewSection: IDefinitionSectionObjectVirtual<IVirtualWrap<IOverview>, 'content'> = {
  sectionLabel: 'general.projectOverview',
  kind: 'object',
  key: 'content',
  mapping: [overviewProjectCard, fdpgCheckNoteCard, overviewAppendixCard],
}
