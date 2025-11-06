import type { IDefinitionCard, IDefinitionSectionObject } from '@/components/Shared/definition-card.types'
import type { ILocationKeyLabel } from '@/types/location.types'
import type { IApplicant, IParticipant, IProposal } from '@/types/proposal.types'

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

const instituteCard = (locationMap: Record<string, ILocationKeyLabel>): IDefinitionCard<IParticipant, 'institute'> => ({
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
            lookupMap: locationMap,
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
})

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

const applicantCards = (locationMap: Record<string, ILocationKeyLabel>) => [
  researcherCard,
  instituteCard(locationMap),
  categoryCard,
]

export const applicantSection = (
  locationMap: Record<string, ILocationKeyLabel>,
): IDefinitionSectionObject<IProposal, 'applicant'> => ({
  sectionLabel: 'proposal.applicant',
  kind: 'object',
  key: 'applicant',
  mapping: applicantCards(locationMap),
})
