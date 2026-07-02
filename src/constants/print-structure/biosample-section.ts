import type {
  DefinitionSection,
  IDefinitionCard,
  IDefinitionCardArray,
} from '@/components/Shared/definition-card.types'
import { PlatformIdentifier } from '@/types/platform-identifier.enum'
import { BiosampleCode, type IProposal, type IUserProject } from '@/types/proposal.types'
import { shouldHideForPlatform } from '@/utils/shouldHideForPlatform.util'

const informationOnRequestedBioSamplesCard: IDefinitionCard<IUserProject, 'informationOnRequestedBioSamples'> = {
  key: 'informationOnRequestedBioSamples',
  cardLabel: 'proposal.selectedBioSamples',
  terms: [
    {
      label: 'proposal.biosampleLaboratoryResources',
      size: 24,
      definitions: [[{ key: 'laboratoryResources' }]],
    },
    {
      label: 'proposal.noSampleRequired',
      size: 24,
      definitions: [[{ key: 'noSampleRequired', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
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
      label: 'proposal.biosampleTypeDetails',
      size: 24,
      definitions: [[{ key: 'typeDetails' }]],
    },
    {
      label: 'proposal.biosampleMaterialRequirements',
      size: 24,
      definitions: [[{ key: 'requirements' }]],
    },
    {
      label: 'proposal.biosampleCount',
      size: 24,
      definitions: [[{ key: 'count' }]],
    },
    {
      label: 'proposal.optionalBiosample',
      size: 24,
      definitions: [[{ key: 'optionalBiosample', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
    },
    {
      label: 'proposal.sampleCode',
      size: 24,
      definitions: [[{ key: 'sampleCode' }]],
    },
    {
      label: 'proposal.SNOMED',
      size: 24,
      definitions: [[{ key: BiosampleCode.SNOMED }]],
    },
    {
      label: 'proposal.SPREC',
      size: 24,
      definitions: [[{ key: BiosampleCode.SPREC }]],
    },
    {
      label: 'proposal.parameter',
      size: 24,
      definitions: [[{ key: 'parameter' }]],
    },
    {
      label: 'proposal.biosampleMethod',
      size: 24,
      definitions: [[{ key: 'method' }]],
    },
    {
      label: 'proposal.externalLabTransfer',
      size: 24,
      definitions: [[{ key: 'externalLabTransfer', kind: 'boolean', true: 'proposal.yes', false: 'proposal.no' }]],
    },
    {
      label: 'proposal.biosampleMaterialRequirements',
      size: 24,
      definitions: [[{ key: 'externalLabTransferDetails' }]],
    },
  ],
}

const biosampleCards = [informationOnRequestedBioSamplesCard, biosamplesCard]

export const biosampleSection = (
  assignedDataSources: PlatformIdentifier[] = [],
  selectedDataSources: PlatformIdentifier[] = [],
): DefinitionSection<IProposal, 'userProject'> => {
  return {
    sectionLabel: 'proposal.selectedBioSamples',
    shouldHide: shouldHideForPlatform(assignedDataSources, PlatformIdentifier.Mii, selectedDataSources),
    kind: 'object',
    key: 'userProject',
    mapping: biosampleCards,
  }
}
