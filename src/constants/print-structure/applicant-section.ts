import type { IDefinitionCard, IDefinitionSectionObject } from '@/components/Shared/definition-card.types'
import type { IApplicant, IParticipant, IProposal } from '@/types/proposal.types'
import { MII_LOCATIONS } from '..'

const researcherCard: IDefinitionCard<IApplicant, 'researcher'> = {
  key: 'researcher',
  cardLabel: 'proposal.personalDetails',
  terms: [
    {
      label: 'general.titleAndName',
      size: 12,
      definitions: [[{ key: 'title' }], [{ key: 'firstName' }, { key: 'lastName' }]],
    },
    {
      label: 'proposal.belongingOptional',
      size: 12,
      definitions: [[{ key: 'affiliation' }]],
    },
    {
      label: 'proposal.emailAddress',
      size: 12,
      definitions: [[{ key: 'email' }]],
    },
  ],
}

const instituteCard: IDefinitionCard<IParticipant, 'institute'> = {
  key: 'institute',
  cardLabel: 'proposal.detailsOfTheInstitutionFacility',
  terms: [
    {
      label: 'proposal.selectionOfMiiLocation',
      size: 24,
      definitions: [
        [
          {
            key: 'miiLocation',
            kind: 'lookup',
            lookupMap: MII_LOCATIONS,
            lookupKey: 'display',
          },
        ],
      ],
    },
    {
      label: 'proposal.fullCorrectNameOfTheInstitutionFacilityJurPerson',
      size: 24,
      hideIfOtherValueIsTruthy: 'miiLocation',
      definitions: [[{ key: 'name' }]],
    },
    {
      label: 'general.address',
      size: 12,
      hideIfOtherValueIsTruthy: 'miiLocation',
      definitions: [
        [{ key: 'streetAddress' }, { key: 'houseNumber' }],
        [{ key: 'postalCode' }, { key: 'city' }],
        [{ key: 'country', prefix: 'countries.', kind: 'translatable' }],
      ],
    },
    {
      label: 'proposal.emailAddress',
      size: 12,
      hideIfOtherValueIsTruthy: 'miiLocation',
      definitions: [[{ key: 'email' }]],
    },
  ],
}

const categoryCard: IDefinitionCard<IParticipant, 'participantCategory'> = {
  key: 'participantCategory',
  cardLabel: 'proposal.involvedCategory',
  terms: [
    {
      label: 'proposal.involvedCategory',
      size: 24,
      definitions: [[{ key: 'category', prefix: 'proposal.participantCategory_', kind: 'translatable' }]],
    },
  ],
}

const applicantCards = [researcherCard, instituteCard, categoryCard]

export const applicantSection: IDefinitionSectionObject<IProposal, 'applicant'> = {
  sectionLabel: 'proposal.applicant',
  kind: 'object',
  key: 'applicant',
  mapping: applicantCards,
}
