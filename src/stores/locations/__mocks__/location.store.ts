import type { ILocation } from '@/types/location.types'

enum MiiLocation {
  BHC = 'BHC',
  MRI = 'MRI',
  KUM = 'KUM',
  UKT = 'UKT',
  UKU = 'UKU',
  UKR = 'UKR',
  UKS = 'UKS',
  UKAU = 'UKAU',
  Charité = 'Charité',
  UMG = 'UMG',
  MHH = 'MHH',
  UKHD = 'UKHD',
  UKSH = 'UKSH',
  UKK = 'UKK',
  UKM = 'UKM',
  UKW = 'UKW',
  UKDD = 'UKDD',
  UKEr = 'UKEr',
  UKF = 'UKF',
  UKFR = 'UKFR',
  UKGI = 'UKGI',
  UKMR = 'UKMR',
  UKG = 'UKG',
  UMMD = 'UMMD',
  UM = 'UM',
  UMM = 'UMM',
  UKA = 'UKA',
  UKB = 'UKB',
  UME = 'UME',
  UKH = 'UKH',
  UKE = 'UKE',
  UKJ = 'UKJ',
  UKL = 'UKL',
  UMR = 'UMR',
  UKD = 'UKD',
  UKRUB = 'UKRUB',
  KC = 'KC',
  CTK = 'CTK',
  UKOWL = 'UKOWL',
  UOL = 'UOL',
  VIV = 'VIV',
}

const MII_LOCATIONS: Record<string, any> = {
  [MiiLocation.BHC]: {
    city: 'Stuttgart',
    display: 'Bosch Health Campus',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.MRI]: {
    // Actual new identifier: 'TUM'
    city: 'München',
    display: 'Klinikum der Technischen Universität München',
    definition: 'DIFUTURE',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.KUM]: {
    city: 'München',
    display: 'LMU Klinikum',
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
    display: 'Universität des Saarlandes / Universitätsklinikum des Saarlandes',
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
    display: 'Universität Münster',
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
    display: 'Technische Universität Dresden',
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
    display: 'Universitätsmedizin Magdeburg',
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
    display: 'Klinikum Chemnitz gGmbH',
    definition: 'MIRACUM',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.CTK]: {
    // Actual new identifier: 'MUL-CT'
    city: 'Cottbus',
    display: 'Medizinische Universität Lausitz - Carl Thiem',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },

  [MiiLocation.UKA]: {
    city: 'Aachen',
    display: 'Universitätsklinikum Aachen',
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

  [MiiLocation.UKOWL]: {
    display: 'Universitätsklinikum OWL',
    definition: 'HiGHmed',
    city: 'Bielefeld',
    email: '',
  },

  [MiiLocation.UOL]: {
    display: 'Carl von Ossietzky Universität Oldenburg',
    definition: 'HiGHmed',
    city: 'Oldenburg',
    email: '',
  },

  [MiiLocation.VIV]: {
    city: 'Berlin',
    display: 'Vivantes Netzwerk für Gesundheit GmbH',
    definition: 'HiGHmed',
    email: 'some.todo@af-universität.de',
  },
}

export const mockLocations = Object.keys(MiiLocation).map((key) => {
  const entry = MII_LOCATIONS[key]

  return {
    _id: key,
    externalCode: key,
    display: entry.display,
    definition: entry.definition,
    consortium: 'consortium',
    contract: 'contract',
    abbreviation: key,
    uri: 'uri',
    rubrum: 'rubrum',
    dataIntegrationCenter: true,
    dataManagementCenter: true,
    deprecationDate: undefined,
    deprecated: false,
  } as ILocation
})

export const useMockLocationStore = {
  getAll: () => mockLocations,
  getAllActive: () => mockLocations,
  getLocationLookupMap: () => Object.fromEntries(mockLocations.map((location) => [location._id, location])),
}
