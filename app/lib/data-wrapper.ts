import { EbirdDataRow, Species } from "../models/data";
import { filterData, type EbirdDataFilter } from './data-filters'
import { tickableSubspecies } from '@/app/lib/sanitise-data';
import { getTicks, type Tick, TickSortType } from './ticks';

function getSpecies(rawData: EbirdDataRow[]): Species[] {

  const speciesMap: Record<string, Species> = {};

  rawData.forEach(ebirdDataRow => {
    let species = speciesMap[ebirdDataRow.scientificName]
    if (!species) {
      species = {
        scientificName: ebirdDataRow.scientificName,
        commonName: ebirdDataRow.commonName,
        taxonomicOrder: ebirdDataRow.taxonomicOrder,
        isSubspecies: tickableSubspecies.includes(ebirdDataRow.scientificName),
        records: [],
      }
      speciesMap[ebirdDataRow.scientificName] = species;
    }
    species.records.push(ebirdDataRow)
  });

  const species = Object.values(speciesMap);
  species.forEach(sp => {
    sp.records = sp.records.sort((a, b) => a.date.getTime() - b.date.getTime())
  })
  return species;
}


class FilteredDataWrapper {
  #data: EbirdDataRow[]
  #species?: Species[]

  constructor(sourceData: EbirdDataRow[], filters: EbirdDataFilter[] = [] ) {
    this.#data = filterData(sourceData, filters)
  }
  get species () {
    if (!this.#species) {
      this.#species = getSpecies(this.#data)
    }
    return this.#species
  }

  getTicks(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): Tick[] {
    return getTicks(this.species, orderedBy, direction === 'desc')
  }

  calve(filters: EbirdDataFilter[]) {
    return new FilteredDataWrapper(this.#data, filters);
  }
}


export function wrapData(sourceData: EbirdDataRow[], filters: EbirdDataFilter[] = []) {
  return new FilteredDataWrapper(sourceData, filters)
}
