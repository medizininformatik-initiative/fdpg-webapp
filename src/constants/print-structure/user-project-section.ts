import type {
  IDefinitionCard,
  IDefinitionCardArray,
  DefinitionSection,
} from '@/components/Shared/definition-card.types'
import type { ILocation, ILocationKeyLabel } from '@/types/location.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import type { IUserProject, IProposal } from '@/types/proposal.types'
import { shouldHideForPlatform } from '@/utils/shouldHideForPlatform.util'

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
      definitions: [[{ key: 'desiredStartTime', kind: 'date', defaultValue: 'proposal.desiredStartTime_immediate' }]],
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
    {
      label: 'proposal.keywords',
      size: 12,
      definitions: [[{ key: 'keywords', isList: true }]],
    },
  ],
}

const cohortsCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
  key: 'cohorts',
  cardLabel: 'proposal.cohortSelection',
  terms: [
    {
      label: 'proposal.selectedCohorts',
      size: 24,
      definitions: [
        [
          {
            key: 'selectedCohorts',
            kind: 'table',
            columns: [
              { key: 'label', label: 'proposal.cohortName' },
              { key: 'numberOfPatients', label: 'proposal.numberOfPatients' },
            ],
          },
        ],
      ],
    },
    {
      label: 'proposal.assessmentOfFeasibilityDetails',
      size: 24,
      definitions: [[{ key: 'details' }]],
    },
  ],
})

const projectDetailsCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'projectDetails',
  cardLabel: 'proposal.projectDetails',
  terms: [
    {
      label: 'proposal.simpleProjectDescription',
      size: 24,
      definitions: [[{ key: 'simpleProjectDescription' }]],
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
    },
    {
      label: 'proposal.executiveSummaryUac',
      size: 24,
      definitions: [[{ key: 'executiveSummaryUac' }]],
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
    },
    {
      label: 'proposal.department',
      size: 24,
      definitions: [[{ key: 'department', prefix: 'departments.', kind: 'translatable', isList: true }]],
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
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
    {
      label: 'proposal.literature',
      size: 24,
      definitions: [[{ key: 'literature' }]],
    },
    {
      label: 'proposal.biometric',
      size: 24,
      definitions: [[{ key: 'biometric' }]],
    },
  ],
})

const ethicVoteCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'ethicVote',
  cardLabel: 'proposal.ethicsVote',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
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
  ],
})

const recontactCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'resourceAndRecontact', //MII
  cardLabel: 'proposal.projectResourcesAndRecontact',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
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
})

const propertyRightsCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  // MII
  key: 'propertyRights',
  cardLabel: 'proposal.propertyRights',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
  terms: [
    {
      label: 'proposal.intellectualPropertyRightCreationApplicationOptions',
      size: 24,
      definitions: [[{ key: 'options' }]],
    },
  ],
})

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
const addresseesCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  locationMap: Record<string, ILocationKeyLabel>,
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'addressees',
  cardLabel: 'proposal.addressees',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
  // MII
  terms: [
    {
      label: 'proposal.desiredLocations',
      size: 24,
      definitions: [
        [{ key: 'desiredLocations', isList: true, kind: 'lookup', lookupMap: locationMap, lookupKey: 'display' }],
      ],
    },
  ],
})

const typeOfUseCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'typeOfUse',
  cardLabel: 'proposal.typeOfUse',
  terms: [
    {
      label: 'proposal.MIItypeOfUse', // MII
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [[{ key: 'usage', isList: true, prefix: 'proposal.typeOfUse_', kind: 'translatable' }]],
    },
    {
      label: 'proposal.pseudonymizationInfo_enableRecordLinkage',
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [
        [
          {
            key: 'pseudonymizationInfoTexts',
            subKeys: ['enableRecordLinkage'],
          },
        ],
      ],
    },

    {
      label: 'proposal.pseudonymizationInfo_siteGroupingEnabled',
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [
        [
          {
            key: 'pseudonymizationInfoTexts',
            subKeys: ['siteGroupingEnabled'],
          },
        ],
      ],
    },

    {
      label: 'proposal.pseudonymizationInfo_namedSiteVariable', // MII
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [
        [
          {
            key: 'pseudonymizationInfoTexts',
            subKeys: ['namedSiteVariable'],
          },
        ],
      ],
    },
    {
      label: 'proposal.targetFormat', // MII
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [[{ key: 'targetFormat' }]],
    },
    {
      label: 'proposal.targetFormatOther', // MII
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
      definitions: [[{ key: 'targetFormatOther' }]],
    },
    {
      label: 'proposal.DIFEtypeOfUse', // DIFE
      size: 24,
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.DIFE, selectedDataSources),
      definitions: [[{ key: 'difeUsage', isList: true, prefix: 'proposal.typeOfUse_', kind: 'translatable' }]],
    },
    {
      label: 'proposal.dataPrivacyExtra', // MII
      shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),

      size: 24,
      definitions: [[{ key: 'dataPrivacyExtra', kind: 'content' }]],
    },
  ],
})

const variableSelectionCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'variableSelection',
  cardLabel: 'proposal.selectionOfVariablesHeader',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.DIFE, selectedDataSources),
  terms: [
    {
      label: 'proposal.typeOfUse', // DIFE
      size: 24,
      definitions: [[{ key: 'DIFE', subKeys: ['typeOfUse'], prefix: 'proposal.difeTypeOfUse_', kind: 'translatable' }]],
    },
    {
      label: 'proposal.userProjectVariableSelectionDifeTypeOfUseExplanation',
      size: 24,
      definitions: [[{ key: 'DIFE', subKeys: ['typeOfUseExplanation'] }]],
    },
  ],
})

const selectionOfCasesCard = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
) => ({
  key: 'selectionOfCases',
  cardLabel: 'proposal.selectionOfCases',
  shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.DIFE, selectedDataSources),
  terms: [
    {
      label: 'proposal.difeSelectionOfCasesHeader',
      size: 24,
      definitions: [
        [
          {
            key: 'difeSelectionOfCases',
            subKeys: ['selectedCases'],
            prefix: 'proposal.difeSelectionOfCases_',
            isList: true,
            kind: 'translatable',
          },
        ],
      ],
    },
    {
      label: 'proposal.difeSelectionOfCases_Other_Header',
      size: 24,
      definitions: [
        [
          {
            key: 'difeSelectionOfCases',
            subKeys: ['otherExplanation'],
          },
        ],
      ],
    },
  ],
})

const userProjectCards = (
  assignedDataSources: PlatformIdentifier[] = [],
  locationMap: Record<string, ILocationKeyLabel>,
  selectedDataSources: PlatformIdentifier[] = [],
) =>
  [
    generalProjectInformationCard,
    projectDetailsCard(assignedDataSources, selectedDataSources),
    ethicVoteCard(assignedDataSources, selectedDataSources),
    recontactCard(assignedDataSources, selectedDataSources),
    propertyRightsCard(assignedDataSources, selectedDataSources),
    plannedPublicationCardEmpty,
    plannedPublicationCard,
    addresseesCard(assignedDataSources, locationMap, selectedDataSources),
    typeOfUseCard(assignedDataSources, selectedDataSources),
    cohortsCard(assignedDataSources, selectedDataSources),
    variableSelectionCard(assignedDataSources, selectedDataSources),
    selectionOfCasesCard(assignedDataSources, selectedDataSources),
  ] as any

export const userProjectSection = (
  assignedDataSources: PlatformIdentifier[] = [],
  locationMap: Record<string, ILocationKeyLabel>,
  selectedDataSources?: PlatformIdentifier[],
): DefinitionSection<IProposal, 'userProject'> => {
  return {
    sectionLabel: 'proposal.informationAboutTheUserProject',
    kind: 'object',
    key: 'userProject',
    mapping: userProjectCards(assignedDataSources, locationMap, selectedDataSources || [PlatformIdentifier.Mii]),
  }
}
