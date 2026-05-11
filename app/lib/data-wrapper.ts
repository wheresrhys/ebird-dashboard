import { EbirdDataRow, Species } from "../models/data";
import { filterData, getYearFilter, type EbirdDataFilter } from './data-filters'
import { tickableSubspecies } from '@/app/lib/sanitise-data';
import { getTicks, buildTickTally, type Tick, TickSortType } from './ticks';

const FIRST_PROPER_EBIRD_YEAR = 2020;

export function excludeNonComparableYears<T>(dataByYear: Record<number, T>): Record<number, T> {
  const thisYear = new Date().getFullYear();
  return Object.fromEntries(Object.entries(dataByYear).filter(([year]) => Number(year) >= FIRST_PROPER_EBIRD_YEAR && Number(year) <= thisYear));
}

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

export function listAvailableYears(data: EbirdDataRow[]): number[] {
  return Array.from(new Set(data.map(row => row.date.getFullYear()))).sort();
}


export class FilteredDataWrapper {
  #data: EbirdDataRow[]
  #species?: Species[]
  #availableYears?: number[]
  #dataByYear?: Record<number, FilteredDataWrapper>

  constructor(sourceData: EbirdDataRow[], filters: EbirdDataFilter[] = [], availableYears?: number[]) {
    this.#data = filterData(sourceData, filters)
    if (availableYears) {
      this.#availableYears = availableYears
    }
  }
  get species () {
    if (!this.#species) {
      this.#species = getSpecies(this.#data)
    }
    return this.#species
  }

  get availableYears() {
    if (!this.#availableYears) {
      this.#availableYears = listAvailableYears(this.#data)
    }
    return this.#availableYears
  }

  get dataByYear() {
    if (!this.#dataByYear) {
      this.#dataByYear = Object.fromEntries(this.availableYears.map(year => [year, this.calve([getYearFilter(year)])]))
    }
    return this.#dataByYear;

  }

  getTicks(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): Tick[] {
    return getTicks(this.species, orderedBy, direction === 'desc')
  }

  // TODO all this by year thing should be in a wrapper class, or maybe an extension??
  // where the ordering is assumed and memoised
  getTicksByYear(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): Record<number, Tick[]> {
    return Object.fromEntries(Object.entries(this.dataByYear).map(([year, yearData]) => [year, yearData.getTicks(orderedBy, direction)]));
  }

  getTicksFromComparableYears(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): Record<number, Tick[]> {
    return excludeNonComparableYears<Tick[]>(this.getTicksByYear(orderedBy, direction))
  }

  getAverageTickTally(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): number[] {
    const comparatorYears = excludeNonComparableYears(this.getTicksByYear(orderedBy, direction));
    const talliesMatrix = Object.values(comparatorYears).map(buildTickTally);
    return talliesMatrix[0].map((_, index) => talliesMatrix.map(tally => tally[index]).reduce((acc, tally) => acc + tally, 0) / talliesMatrix.length)
  }


  calve(filters: EbirdDataFilter[]) {
    return new FilteredDataWrapper(this.#data, filters, this.availableYears);
  }
}


export function wrapData(sourceData: EbirdDataRow[], filters: EbirdDataFilter[] = []) {
  return new FilteredDataWrapper(sourceData, filters)
}
