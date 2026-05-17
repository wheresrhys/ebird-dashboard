import { EbirdDataRow, Species } from "../models/types";
import { filterData, getYearFilter, type EbirdDataFilter } from './data-filters'
import { tickableSubspecies } from '@/app/lib/sanitise-data';
import { TickWrapper, type TickSortType} from './ticks';
import { listConfigMap } from '../models/lists';
import {DataMemoizer} from './data-memoizer';

type DataWrapperOptions = {
  availableYears?: number[],
  allTimeData?: DataWrapper | null
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

export type DataWrapperOptions2 = { listId?: string, year?: number }


export class DataWrapper {
  #data: EbirdDataRow[]
  #species?: Species[]
  #availableYears?: number[]
  #dataByList: Record<string, DataWrapper> = {}
  #allTimeData?: DataWrapper
  #memoizer: DataMemoizer;
  #options: DataWrapperOptions2;
  constructor(
    sourceData: EbirdDataRow[],
    filters: EbirdDataFilter[] = [],
    {availableYears, allTimeData}: DataWrapperOptions = {},
    options?: DataWrapperOptions2,
    memoizer?: DataMemoizer
  ) {
    this.#data = filterData(sourceData, filters)
    this.#memoizer = memoizer ?? new DataMemoizer(this);
    if (availableYears) {
      this.#availableYears = availableYears
    }
    if (allTimeData) {
      this.#allTimeData = allTimeData
    }
    this.#options = options ?? {};
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

  get allTimeData(): DataWrapper {
    return this.#allTimeData || this
  }

  getDataForYear(year: number) {
    return this.#memoizer.getChildDataWrapper({year})
  }

  get dataByYear() {
    return Object.fromEntries(this.availableYears.map(year => [year, this.getDataForYear(year)]))
  }

  // todo - memoise this
  getTicks(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): TickWrapper {
    return new TickWrapper(this, orderedBy, direction)
  }

  calve(filters: EbirdDataFilter[], options: DataWrapperOptions = {}) {
    return new DataWrapper(this.#data, filters, { ...options, availableYears: this.availableYears});
  }

  newCalve(options: DataWrapperOptions2) {
    const { listId, year } = options;
    const filters = [];
    if (year) {
      filters.push(getYearFilter(year))
    }
    if (listId) {
      filters.push(...listConfigMap[listId].filters)
    }

    return new DataWrapper(
      this.#data,
      filters,
      {
        allTimeData: year ? this : null,
        availableYears: year ? [year] : this.availableYears
      },
      {...this.#options, ...options},
      this.#memoizer
    );
  }

  calveForList(listId: string) {
    // return this.newCalve({listId})
    if (!this.#dataByList[listId]) {
      const { filters } = listConfigMap[listId];
      this.#dataByList[listId] = this.calve(filters);
    }
    return this.#dataByList[listId];
  }
}

export function wrapData(sourceData: EbirdDataRow[], filters: EbirdDataFilter[] = []) {
  return new DataWrapper(sourceData, filters)
}
