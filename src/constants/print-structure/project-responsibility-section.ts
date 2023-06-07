import type { IDefinitionCard, IDefinitionSectionObject } from '@/components/Shared/definition-card.types'
import type { IProjectResponsible, IProposal } from '@/types/proposal.types'
import { MII_LOCATIONS } from '..'

const projectResponsibilityCard: IDefinitionCard<IProjectResponsible, 'projectResponsibility'> = {
  key: 'projectResponsibility',
  cardLabel: 'proposal.personalDetails',
  hideIfOtherValueIsTruthy: ['researcher', 'email'],
  terms: [
    {
      label: 'proposal.applicantIsProjectResponsible',
      size: 12,
      definitions: [
        [{ key: 'applicantIsProjectResponsible', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }],
      ],
    },
  ],
}

const projectResponsibleCard: IDefinitionCard<IProjectResponsible, 'researcher'> = {
  key: 'researcher',
  cardLabel: 'proposal.personalDetails',
  hideIfOtherValueIsTruthy: ['projectResponsibility', 'applicantIsProjectResponsible'],
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

const instituteCard: IDefinitionCard<IProjectResponsible, 'institute'> = {
  key: 'institute',
  cardLabel: 'proposal.detailsOfTheInstitutionFacility',
  hideIfOtherValueIsTruthy: ['projectResponsibility', 'applicantIsProjectResponsible'],
  terms: [
    {
      label: 'proposal.selectionOfMiiLocation',
      size: 24,
      hideIfThisValueIsFalsy: 'miiLocation',
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

const categoryCard: IDefinitionCard<IProjectResponsible, 'participantCategory'> = {
  key: 'participantCategory',
  cardLabel: 'proposal.involvedCategory',
  hideIfOtherValueIsTruthy: ['projectResponsibility', 'applicantIsProjectResponsible'],
  terms: [
    {
      label: 'proposal.involvedCategory',
      size: 24,
      definitions: [[{ key: 'category', prefix: 'proposal.participantCategory_', kind: 'translatable' }]],
    },
  ],
}

const projectResponsibilityCards = [projectResponsibilityCard, projectResponsibleCard, instituteCard, categoryCard]

export const projectResponsibilitySection: IDefinitionSectionObject<IProposal, 'projectResponsible'> = {
  sectionLabel: 'proposal.projectResponsible',
  kind: 'object',
  key: 'projectResponsible',
  mapping: projectResponsibilityCards,
}
