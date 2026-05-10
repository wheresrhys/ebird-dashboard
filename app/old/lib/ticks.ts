import { createDb, type DB } from '../models/create-db';
import type { Species, Location } from '../../models/data';
import { filterData, getYearFilter, type EBirdDataFilter } from './data-filters';
import { listAvailableYears } from '../models/load-csv';

const FIRST_PROPER_EBIRD_YEAR = 2020;

export type Tick = {
  species: Species;
  date: Date;
  submissionId: string;
  location: Location
}

const sortValueGetters: Record<string, (tick: Tick) => number> = {
  taxonomicOrder: (tick: Tick) => tick.species.taxonomicOrder as number,
  date: (tick: Tick)=>tick.date.getTime()
}

function getTicks(db: DB, sortBy: 'taxonomicOrder' | 'date'): Tick[] {
  const sortValueGetter = sortValueGetters[sortBy];
  return db.species.map(species => ({
    species,
    date: species.records[0].submission.date,
    submissionId: species.records[0].submission.submissionId,
    location: species.records[0].submission.location
  })).sort((a, b) => sortValueGetter(a) - sortValueGetter(b));
}

export function getTicksWithFilters(filters: EBirdDataFilter[], sortBy: 'taxonomicOrder' | 'date'): Tick[] {
  const records = filterData(filters);
  const db = createDb(records);
  return getTicks(db, sortBy);
}

export function getTicksByYear(filters: EBirdDataFilter[], sortBy: 'taxonomicOrder' | 'date'): Record<number, Tick[]> {
  const listOfYears = listAvailableYears();
  return Object.fromEntries(listOfYears.map(year => [year, getTicksWithFilters([...filters, getYearFilter(year)], sortBy)]));
}



export function excludeNonComparableYears(ticksByYear: Record<number, Tick[]>): Record<number, Tick[]> {
  const thisYear = new Date().getFullYear();
  return Object.fromEntries(Object.entries(ticksByYear).filter(([year, ticks]) => Number(year) >= FIRST_PROPER_EBIRD_YEAR && Number(year) <= thisYear));
}
