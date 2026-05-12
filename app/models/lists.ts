import { EbirdDataFilter } from "../lib/data-filters"

type ListConfig = {
  name: string,
  filters: EbirdDataFilter[]
}

export const listConfigs: ListConfig[] = [
  {
    name: 'UK',
    filters: []
  },
  {
    name: 'London',
    filters: [row => row.county === 'London']
  },
  {
    name: 'Wider patch',
    filters: [row =>
      ['L12106041', 'L1236726', 'L2083779', 'L8046904', 'L11781329', 'L12107169', 'L5850700', 'L1349703', 'L6820003', 'L8933164', 'L15798703', 'L12106406', 'L12106053'].includes(row.locationId)
    ]
  },
  {
    name:"Wetlands",
    filters:[row =>
      ['L2083779'].includes(row.locationId)
    ]
  },
  {
    name: "Marshes",
    filters: [row =>
      ['L1236726', 'L12106041'].includes(row.locationId)
    ]
  },
  {
    name: "Lizard",
    filters: [row =>
      ['L8046904'].includes(row.locationId)
    ]
  }
]




