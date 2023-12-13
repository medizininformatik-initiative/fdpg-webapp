import type {
  IDefinitionCard,
  IDefinitionCardArray,
  IDefinitionSectionObject,
} from '@/components/Shared/definition-card.types'
import { MII_LOCATIONS } from '@/constants'
import type { IUserProject, IProposal } from '@/types/proposal.types'

const generalProjectInformationCard: IDefinitionCard<IUserProject, 'generalProjectInformation'> = {
  key: 'generalProjectInformation',
  cardLabel: 'proposal.generalProjectInformation',
  terms: [
    {
      label: 'proposal.projectTitle',
      size: 24,
      definitions: [[{ key: 'projectTitle' }]],
    },
    {
      label: 'proposal.desiredStartTime',
      size: 12,
      definitions: [[{ key: 'desiredStartTime', kind: 'date' }]],
    },
    {
      label: 'proposal.projectDuration',
      size: 12,
      definitions: [[{ key: 'projectDuration' }]],
    },
    {
      label: 'proposal.projectFunding',
      size: 12,
      definitions: [[{ key: 'projectFunding' }]],
    },
    {
      label: 'proposal.fundingReferenceNumber',
      size: 12,
      definitions: [[{ key: 'fundingReferenceNumber' }]],
    },
  ],
}

const feasibilityCard: IDefinitionCard<IUserProject, 'feasibility'> = {
  key: 'feasibility',
  cardLabel: 'proposal.feasibility',
  terms: [
    {
      label: 'proposal.feasibilityId',
      size: 24,
      definitions: [[{ key: 'id' }]],
    },
    {
      label: 'proposal.assessmentOfFeasibilityDetails',
      size: 24,
      definitions: [[{ key: 'details' }]],
    },
  ],
}

const projectDetailsCard: IDefinitionCard<IUserProject, 'projectDetails'> = {
  key: 'projectDetails',
  cardLabel: 'proposal.projectDetails',
  terms: [
    {
      label: 'proposal.simpleProjectDescription',
      size: 24,
      definitions: [[{ key: 'simpleProjectDescription' }]],
    },
    {
      label: 'proposal.department',
      size: 24,
      definitions: [[{ key: 'department', prefix: 'departments.', kind: 'translatable', isList: true }]],
    },
    {
      label: 'proposal.hypothesisAndQuestionProjectGoals',
      size: 24,
      definitions: [[{ key: 'hypothesisAndQuestionProjectGoals' }]],
    },
    {
      label: 'proposal.scientificBackground',
      size: 24,
      definitions: [[{ key: 'scientificBackground' }]],
    },
    {
      label: 'proposal.materialAndMethods',
      size: 24,
      definitions: [[{ key: 'materialAndMethods' }]],
    },
  ],
}

const ethicVoteCard: IDefinitionCard<IUserProject, 'ethicVote'> = {
  key: 'ethicVote',
  cardLabel: 'proposal.ethicsVote',
  terms: [
    {
      label: 'proposal.ethicVoteExistingLabel',
      size: 24,
      definitions: [[{ key: 'isExisting', kind: 'boolean', true: 'proposal.present', false: 'proposal.notRequired' }]],
    },
    {
      label: 'proposal.ethicsCommittee',
      size: 24,
      definitions: [[{ key: 'ethicsCommittee' }]],
      hideIfThisValueIsFalsy: 'isExisting',
    },
    {
      label: 'proposal.ethicsVoteNumber',
      size: 12,
      definitions: [[{ key: 'ethicsVoteNumber' }]],
      hideIfThisValueIsFalsy: 'isExisting',
    },
    {
      label: 'proposal.voteFromDate',
      size: 12,
      definitions: [[{ key: 'voteFromDate', kind: 'date' }]],
      hideIfThisValueIsFalsy: 'isExisting',
    },
    {
      label: 'proposal.admitReputationOfAttachment',
      size: 24,
      definitions: [
        [{ key: 'admitReputationOfAttachment', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }],
      ],
      hideIfThisValueIsFalsy: 'isExisting',
    },
  ],
}

const recontactCard: IDefinitionCard<IUserProject, 'resourceAndRecontact'> = {
  key: 'resourceAndRecontact',
  cardLabel: 'proposal.projectResourcesAndRecontact',
  terms: [
    {
      label: 'proposal.areSufficientProfessionalAndFinancialResourcesAvailable',
      size: 24,
      definitions: [[{ key: 'hasEnoughResources', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
    },
    {
      label: 'proposal.additionalDataCollection',
      size: 24,
      definitions: [[{ key: 'isRecontactingIntended', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
    },
  ],
}

const propertyRightsCard: IDefinitionCard<IUserProject, 'propertyRights'> = {
  key: 'propertyRights',
  cardLabel: 'proposal.propertyRights',
  terms: [
    {
      label: 'proposal.intellectualPropertyRightCreationApplicationOptions',
      size: 24,
      definitions: [[{ key: 'options' }]],
    },
  ],
}

const plannedPublicationCardEmpty: IDefinitionCard<IUserProject, 'plannedPublication'> = {
  key: 'plannedPublication',
  cardLabel: 'proposal.plannedPublications',
  hideIfOtherValueIsTruthy: ['plannedPublication', 'publications'],
  terms: [
    {
      label: 'proposal.noPublicationIsPlanned',
      size: 24,
      definitions: [[{ key: 'noPublicationPlanned', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
    },
  ],
}

const plannedPublicationCard: IDefinitionCardArray<IUserProject, 'plannedPublication', 'publications'> = {
  key: 'plannedPublication',
  cardLabel: 'proposal.plannedPublications',
  loopOn: 'publications',
  hideIfOtherValueIsTruthy: ['plannedPublication', 'noPublicationPlanned'],
  terms: [
    {
      label: 'proposal.type',
      size: 24,
      definitions: [[{ key: 'type', prefix: 'proposal.publicationType_', kind: 'translatable' }]],
    },
    {
      label: 'proposal.description',
      size: 24,
      definitions: [[{ key: 'description' }]],
    },
    {
      label: 'proposal.authors',
      size: 24,
      definitions: [[{ key: 'authors' }]],
    },
  ],
}

const addresseesCard: IDefinitionCard<IUserProject, 'addressees', typeof MII_LOCATIONS> = {
  key: 'addressees',
  cardLabel: 'proposal.addressees',
  terms: [
    {
      label: 'proposal.desiredLocations',
      size: 24,
      definitions: [
        [{ key: 'desiredLocations', isList: true, kind: 'lookup', lookupMap: MII_LOCATIONS, lookupKey: 'display' }],
      ],
    },
  ],
}

const typeOfUseCard: IDefinitionCard<IUserProject, 'typeOfUse'> = {
  key: 'typeOfUse',
  cardLabel: 'proposal.typeOfUse',
  terms: [
    {
      label: 'proposal.typeOfUse',
      size: 24,
      definitions: [[{ key: 'usage', isList: true, prefix: 'proposal.typeOfUse_', kind: 'translatable' }]],
    },
    {
      label: 'proposal.dataPrivacyExtra',
      size: 24,
      definitions: [[{ key: 'dataPrivacyExtra', kind: 'content' }]],
    },
  ],
}

const biosamplesCard: IDefinitionCardArray<IUserProject, 'informationOnRequestedBioSamples', 'biosamples'> = {
  key: 'informationOnRequestedBioSamples',
  cardLabel: 'proposal.informationOnRequestedBioSamples',
  loopOn: 'biosamples',
  terms: [
    {
      label: 'proposal.biosampleType',
      size: 24,
      definitions: [[{ key: 'type' }]],
    },
    {
      label: 'proposal.biosampleCount',
      size: 24,
      definitions: [[{ key: 'count' }]],
    },
    {
      label: 'proposal.biosampleParameter',
      size: 24,
      definitions: [[{ key: 'parameter' }]],
    },
    {
      label: 'proposal.biosampleLaboratoryResources',
      size: 24,
      definitions: [[{ key: 'laboratoryResources' }]],
    },
    {
      label: 'proposal.biosampleMaterialRequirements',
      size: 24,
      definitions: [[{ key: 'requirements' }]],
    },
  ],
}

const userProjectCards = [
  generalProjectInformationCard,
  feasibilityCard,
  projectDetailsCard,
  ethicVoteCard,
  recontactCard,
  propertyRightsCard,
  plannedPublicationCardEmpty,
  plannedPublicationCard,
  addresseesCard,
  typeOfUseCard,
  biosamplesCard,
]

export const userProjectSection: IDefinitionSectionObject<IProposal, 'userProject'> = {
  sectionLabel: 'proposal.informationAboutTheUserProject',
  kind: 'object',
  key: 'userProject',
  mapping: userProjectCards,
}
