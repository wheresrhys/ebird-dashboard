import { EbirdDataFilter } from "../lib/data-filters"
import { County, LocationId, SubmissionId } from "./types"
const lowCarbonCounties: County[] = [
'East Sussex',
'London',
'Kent',
'Essex',
'Suffolk',
'Hertfordshire',
'Surrey',
'West Sussex']

const lowCarbonLocations: LocationId[] = [
'L13996145',
'L15697593',
'L39903188',
'L39867202',
'L10342847',
'L17212012',
'L19601252',
'L46652850'
]

// these overrides last updated 12/5/2026
const lowCarbonSubmissions: SubmissionId[] = [
'S171491952',
'S171448048',
'S171143507',
'S171254934',
'S171003718',
'S170805298',
'S170769654',
'S170750215',
'S169936393',
'S152014186',
'S152005838',
'S151966038',
'S151965975',
'S262545412',
'S94821745',
  'S113826753',
  'S260503815',
  'S260505502',
  'S152014186',
  'S260506079'
]

// reserve for truly hard to get to places I'm never likely to go to without a car
const nonLowCarbonLocations: LocationId[] = [
  'L970514'
]

const nonLowCarbonSubmissions: SubmissionId[] =[
  'S126717146',
  'S126624824',
  'S312297119',
  'S310654152',
  'S111147025',
  'S310674805',
  'S111146970',
  'S311275417',
  'S88748962',
  'S220040231',
  'S111146933'
]

function isLowCarbon({
  submissionId,
  county,
  locationId,
}: {
  submissionId: SubmissionId,
  county: County,
  locationId: LocationId,
}) {
  if (nonLowCarbonSubmissions.includes(submissionId)) {
    return false;
  }

  if (nonLowCarbonLocations.includes(locationId)) {
    return false
  }
  return lowCarbonCounties.includes(county) || lowCarbonLocations.includes(locationId) || lowCarbonSubmissions.includes(submissionId)
}

type ListConfig = {
  id: string,
  name: string,
  filters: EbirdDataFilter[]
}

export const listConfigMap: Record<string, Omit<ListConfig, 'id'>> = {
  uk: {
    name: 'UK',
    filters: []
  },
  lowCarbon: {
    name: 'Low Carbon',
    filters: [isLowCarbon]
  },
  london: {
    name: 'London',
    filters: [row => row.county === 'London']
  },
  widerPatch:{
    name: 'Wider patch',
    filters: [row =>
      ['L12106041', 'L1236726', 'L2083779', 'L8046904', 'L11781329', 'L12107169', 'L5850700', 'L1349703', 'L6820003', 'L8933164', 'L15798703', 'L12106406', 'L12106053'].includes(row.locationId)
    ]
  },
  wetlands: {
    name:"Wetlands",
    filters:[row =>
      ['L2083779'].includes(row.locationId)
    ]
  },
  marshes: {
    name: "Marshes",
    filters: [row =>
      ['L1236726', 'L12106041'].includes(row.locationId)
    ]
  },
  lizard:{
    name: "Lizard",
    filters: [row =>
      ['L8046904'].includes(row.locationId)
    ]
  }
}
export const listConfigs = Object.entries(listConfigMap).map(([id, config]) =>  ({id, ...config}))
