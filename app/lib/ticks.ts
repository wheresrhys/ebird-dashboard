import { EbirdDataRow, Species } from "../models/data";
import { type DataWrapper } from './data-wrapper';
import { Temporal } from 'temporal-polyfill';
const FIRST_PROPER_EBIRD_YEAR = 2020;

export type Tick = {
  species: Species;
  salientRecord: EbirdDataRow
}

export type TickSortType = 'taxonomicOrder' | 'firstSeen' | 'lastSeen';

const tickSortValueGetters: Record<TickSortType, (tick: Tick) => number> = {
  taxonomicOrder: (tick: Tick) => tick.species.taxonomicOrder as number,
  firstSeen: (tick: Tick) => tick.salientRecord?.date.getTime() as number,
  lastSeen: (tick: Tick) => -(tick.salientRecord?.date.getTime() as number),
}

function getTickSorter(property: TickSortType): (a: Tick, b: Tick) => number {
  const valueGetter = tickSortValueGetters[property];
  return (a, b) => valueGetter(a) - valueGetter(b);
}

export function getTicks(species: Species[], orderedBy:TickSortType, reversed: boolean = false): Tick[] {

    const ticks = species.map(species => {
      const tick: Tick = { species, salientRecord: species.records[0] }
      if (orderedBy === 'lastSeen') {
        tick.salientRecord = species.records[species.records.length - 1];
      }
      return tick
    }).sort(getTickSorter(orderedBy))

    return reversed ? ticks.reverse() : ticks;
}





export function excludeNonComparableYears<T>(dataByYear: Record<number, T>): Record<number, T> {
  const thisYear = new Date().getFullYear();
  return Object.fromEntries(Object.entries(dataByYear).filter(([year]) => Number(year) >= FIRST_PROPER_EBIRD_YEAR && Number(year) <= thisYear));
}

export function buildTickTally(tickWrapper: TickWrapper): number[] {
  const tickTimings = tickWrapper.ticks.map(tick =>
    Temporal.PlainDate.from(tick.salientRecord.date.toISOString().split('T')[0]).dayOfYear)
  const ticksPerDay = [...Array(365)].map((_, index) =>
    tickTimings.filter(timing => timing === index + 1).length);
  let ticksSoFar = 0
  return ticksPerDay.map(ticks => {
    ticksSoFar += ticks;
    return ticksSoFar;
  })
}

export class TickWrapper {
  #dataWrapper: DataWrapper
  #orderedBy: TickSortType
  #direction: 'asc' | 'desc'
  #reverseOrder: boolean
  #ticks?: Tick[]
  #ticksByYear?: Record<number, TickWrapper>
  constructor(dataWrapper: DataWrapper, orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc') {
    this.#dataWrapper = dataWrapper;
    this.#orderedBy = orderedBy;
    this.#direction = direction;
    this.#reverseOrder = direction === 'desc';
  }

  get ticks(): Tick[] {
    if (!this.#ticks) {
      this.#ticks = getTicks(this.#dataWrapper.species, this.#orderedBy, this.#reverseOrder)
    }
    return this.#ticks
  }

  get ticksByYear(): Record<number, TickWrapper> {
    if (!this.#ticksByYear) {
      this.#ticksByYear = Object.fromEntries(Object.entries(this.#dataWrapper.dataByYear).map(([year, yearData]) => [year, yearData.getTicks(this.#orderedBy, this.#direction)]));
    }
    return this.#ticksByYear
  }

  get ticksFromComparableYears(): Record<number, TickWrapper> {
    return excludeNonComparableYears<TickWrapper>(this.ticksByYear)
  }

  get averageTickTally(): number[] {
    const comparatorYears = this.ticksFromComparableYears;
    const talliesMatrix = Object.values(comparatorYears).map(buildTickTally);
    return talliesMatrix[0].map((_, index) => talliesMatrix.map(tally => tally[index]).reduce((acc, tally) => acc + tally, 0) / talliesMatrix.length)
  }
}
