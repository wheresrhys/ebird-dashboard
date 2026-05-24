import type { EbirdDataRow, EbirdDataServerRow, Species } from "../models/types";
import { filterData, getYearFilter, type EbirdDataFilter, PAST_YEARS, ALL_YEARS } from './data-filters'
import { tickableSubspecies } from '@/app/lib/sanitise-data';
import { TickWrapper, type TickSortType} from './ticks';
import { listConfigMap } from '../models/lists';
import {SimpleCache} from './simple-cache';
import { Temporal } from 'temporal-polyfill';

type DataWrapperMeta = {
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
  return species;
}

export function listAvailableYears(data: EbirdDataRow[]): number[] {
  return Array.from(new Set(data.map(row => row.date.year))).sort();
}

export type DataWrapperOptions = { listId?: string, year?: number};


export class DataWrapper {
  #data: EbirdDataRow[]
  #species?: Species[]
  #allTimeData?: DataWrapper
  #options: DataWrapperOptions;
  constructor(
    sourceData: EbirdDataRow[],
    options: DataWrapperMeta & DataWrapperOptions = {},
  ) {
    this.#data = sourceData;
    if (options.allTimeData) {
      this.#allTimeData = options.allTimeData
    }
    this.#options = {year: options.year, listId: options.listId};
  }
  get species () {
    if (!this.#species) {
      this.#species = getSpecies(this.#data)
    }
    return this.#species
  }

  get allTimeData(): DataWrapper {
    return this.#allTimeData || this
  }

  getDataForYear(year: number): DataWrapper {
    return this.calve({ year });
  }

  get dataByYear() {
    return Object.fromEntries(ALL_YEARS.map(year => [year, this.getDataForYear(year)]))
  }

  get options() {
    return this.#options;
  }

  hasData() {
    return Boolean(this.#data.length)
  }

  getTicks(orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc'): TickWrapper {
    return TickWrapper.construct(this, orderedBy, direction)
  }

  filter(filter: EbirdDataFilter) {
    return new DataWrapper(filterData(this.#data, [filter]));
  }

  calve(options: DataWrapperOptions) {
    const { listId, year } = options;
    const memoOptions = { ...this.#options, ...options }

    if (!DataWrapper.cache.hasItem(memoOptions)) {
      const filters = [];
      if (year) {
        filters.push(getYearFilter(year))
      }
      if (listId) {
        filters.push(...listConfigMap[listId].filters)
      }
      const filteredData = filterData(this.#data, filters)
      const calvedWrapper = new DataWrapper(
        filteredData,
        {
          allTimeData: year ? this : null,
          ...memoOptions
        },
      );
      DataWrapper.cache.setItem(memoOptions, calvedWrapper)
    }
    return DataWrapper.cache.getItem(memoOptions);
  }

  getDataForList(listId: string) {
    return this.calve({ listId });
  }

  static cache = new SimpleCache<DataWrapper, DataWrapperOptions>(
  ({
    listId,
    year
  }: DataWrapperOptions) => `${listId ?? 'no-list'}:${year ? String(year) : 'no-year'}`);

}

// TDOD turn intoa static class method and put memoisation in here too
export function wrapServerData(sourceData: EbirdDataServerRow[]) {
  return new DataWrapper(sourceData.map(row => (
    {
      ...row,
      //@ts-expect-error
      date: new Temporal.PlainDate(...row.date.split('-'))
    }
  ))
  // TODO sort on server
  .sort((a, b) => Temporal.PlainDate.compare(a.date, b.date)))
}
