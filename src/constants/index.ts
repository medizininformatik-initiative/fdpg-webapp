import { CardType } from '@/types/component.types'
import { Countries, MiiLocation } from '@/types/location.enum'
import { Role } from '@/types/oidc.types'
import { ProjectFetchingType } from '@/types/proposal.types'
import { PanelQuery } from '@/types/sort-filter.types'

interface IMiiLocationInfo {
  city: string
  display: string
  definition: string
  email: string
}

export const MII_LOCATIONS: Record<MiiLocation, IMiiLocationInfo> = {
  [MiiLocation.MRI]: {
    city: 'München',
    display: 'Klinikum rechts der Isar',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.KUM]: {
    city: 'München',
    display: 'Klinikum der Universität München',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKT]: {
    city: 'Tübingen',
    display: 'Universitätsklinikum Tübingen',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKU]: {
    city: 'Ulm',
    display: 'Universitätsklinikum Ulm',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKR]: {
    city: 'Regensburg',
    display: 'Universitätsklinikum Regensburg',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKS]: {
    city: 'Homburg',
    display: 'Universitätsklinikum des Saarlandes',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKAU]: {
    city: 'Augsburg',
    display: 'Universitätsklinikum Augsburg',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.Charité]: {
    city: 'Berlin',
    display: 'Charité - Universitätsmedizin Berlin',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UMG]: {
    city: 'Göttingen',
    display: 'Universitätsmedizin Göttingen',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.MHH]: {
    city: 'Hannover',
    display: 'Medizinische Hochschule Hannover',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKHD]: {
    city: 'Heidelberg',
    display: 'Universitätsklinikum Heidelberg',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKSH]: {
    city: 'Kiel',
    display: 'Universitätsklinikum Schleswig-Holstein',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKK]: {
    city: 'Köln',
    display: 'Universitätsklinikum Köln',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKM]: {
    city: 'Münster',
    display: 'Universitätsklinikum Münster',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKW]: {
    city: 'Würzburg',
    display: 'Universitätsklinikum Würzburg',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKDD]: {
    city: 'Dresden',
    display: 'Universitätsklinikum Carl Gustav Carus Dresden',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKEr]: {
    city: 'Erlangen',
    display: 'Universitätsklinikum Erlangen',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKF]: {
    city: 'Frankfurt',
    display: 'Universitätsklinikum Frankfurt',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKFR]: {
    city: 'Freiburg',
    display: 'Universitätsklinikum Freiburg',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKGI]: {
    city: 'Gießen',
    display: 'Universitätsklinikum Gießen',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKMR]: {
    city: 'Marburg',
    display: 'Universitätsklinikum Marburg',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKG]: {
    city: 'Greifswald',
    display: 'Universitätsmedizin Greifswald',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UMMD]: {
    city: 'Magdeburg',
    display: 'Universitätsklinikum Magdeburg',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UM]: {
    city: 'Mainz',
    display: 'Universitätsmedizin der Johannes Gutenberg-Universität Mainz',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UMM]: {
    city: 'Mannheim',
    display: 'Universitätsklinikum Mannheim',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.KC]: {
    city: 'Chemnitz',
    display: ' Klinikum Chemnitz gGmbH',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKA]: {
    city: 'Aachen',
    display: 'Uniklinik RWTH Aachen',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKB]: {
    city: 'Bonn',
    display: 'Universitätsklinikum Bonn',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UME]: {
    city: 'Essen',
    display: 'Universitätsklinikum Essen',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKH]: {
    city: 'Halle (Saale)',
    display: 'Universitätsklinikum Halle (Saale)',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKE]: {
    city: 'Hamburg-Eppendorf',
    display: 'Universitätsklinikum Hamburg-Eppendorf',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKJ]: {
    city: 'Jena',
    display: 'Universitätsklinikum Jena',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKL]: {
    city: 'Leipzig',
    display: 'Universitätsklinikum Leipzig',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UMR]: {
    city: 'Rostock',
    display: 'Universitätsmedizin Rostock',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKD]: {
    city: 'Düsseldorf',
    display: 'Universitätsklinikum Düsseldorf',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKRUB]: {
    city: 'Bochum',
    display: 'Universitätsklinikum der Ruhr-Universität Bochum',
    definition: 'SMITH',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.VirtualAll]: {
    city: 'Alle Standorte',
    display: 'Alle Standorte',
    definition: 'VIRTUAL',
    email: '',
  },
}

export const INACTIVE_LOCATIONS = [MiiLocation.UKS, MiiLocation.UMR, MiiLocation.UKD, MiiLocation.UKRUB]
export const SORTED_ACTIVE_LOCATION_OPTIONS = Object.entries(MII_LOCATIONS)
  .filter(([key]) => key !== MiiLocation.VirtualAll && !INACTIVE_LOCATIONS.includes(key as MiiLocation))
  .sort(([_aKey, aValue], [_bKey, bValue]) => aValue.city.localeCompare(bValue.city))
  .map(([key, value]) => ({ label: value.display, value: key }))

export const countryOptions = (t) =>
  Object.values(Countries).map((value) => ({
    label: t(`countries.${value}`),
    value,
  }))

const defaultColumns = [
  {
    prop: 'createdAt',
    header: 'dashboard.application',
    sortable: true,
    type: 'date',
  },
  {
    prop: 'projectAbbreviation',
    header: 'dashboard.projectAbbreviations',
    sortable: true,
    type: 'tag',
  },
  {
    prop: 'ownerName',
    header: 'general.applicant',
    sortable: true,
  },
]
export const tableColumns = {
  [PanelQuery.FdpgRequestedInWork]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],
  [PanelQuery.FdpgPendingInWork]: [
    ...defaultColumns,
    {
      prop: 'vote',
      header: 'dashboard.uacVote',
    },
    {
      prop: 'data',
      header: 'proposal.dataVolume',
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],
  [PanelQuery.FdpgOngoingInWork]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
    {
      prop: 'computedDueDate',
      header: 'dashboard.dueDate',
      sortable: true,
      type: 'dueDate',
    },
  ],

  [PanelQuery.FdpgFinished]: [
    ...defaultColumns,
    {
      prop: 'projectTitle',
      header: 'dashboard.projectTitle',
      sortable: true,
    },
  ],
}

export const PanelQueryObj = {
  [Role.FdpgMember]: {
    [CardType.Pending]: {
      [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgPendingToCheck,
      [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgPendingInWork,
    },
    [CardType.Requested]: {
      [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgRequestedToCheck,
      [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgRequestedInWork,
    },
    [CardType.Ongoing]: {
      [ProjectFetchingType.TO_CHECK]: PanelQuery.FdpgOngoingToCheck,
      [ProjectFetchingType.IN_WORK]: PanelQuery.FdpgOngoingInWork,
    },
    [CardType.Completed]: PanelQuery.FdpgFinished,
  },

  [Role.Researcher]: {
    [CardType.Draft]: PanelQuery.Draft,
    [CardType.Pending]: PanelQuery.ResearcherPending,
    [CardType.Ongoing]: PanelQuery.ResearcherOngoing,
    [CardType.Completed]: PanelQuery.ResearcherFinished,
  },

  [Role.UacMember]: {
    [CardType.Pending]: PanelQuery.UacPending,
    [CardType.Ongoing]: PanelQuery.UacOngoing,
    [CardType.Completed]: PanelQuery.UacFinished,
    [CardType.Requested]: PanelQuery.UacRequested,
  },

  [Role.DizMember]: {
    [CardType.Pending]: PanelQuery.DizPending,
    [CardType.Ongoing]: PanelQuery.DizOngoing,
    [CardType.Completed]: PanelQuery.DizFinished,
    [CardType.Requested]: PanelQuery.DizRequested,
  },
}
