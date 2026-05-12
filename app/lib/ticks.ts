import { EbirdDataRow, Species, ScientificName, LocationName } from "../models/types";
import { type DataWrapper } from './data-wrapper';
import { Temporal } from 'temporal-polyfill';

const FIRST_PROPER_EBIRD_YEAR = 2020;

export type Tick = Omit<Species, 'records'> & {
  salientRecord: EbirdDataRow;
}

export type TickSortType = 'taxonomicOrder' | 'firstSeen' | 'lastSeen';

const tickSortValueGetters: Record<TickSortType, (tick: Tick) => number> = {
  taxonomicOrder: (tick: Tick) => tick.taxonomicOrder as number,
  firstSeen: (tick: Tick) => tick.salientRecord?.date.getTime() as number,
  lastSeen: (tick: Tick) => -(tick.salientRecord?.date.getTime() as number),
}

function getTickSorter(property: TickSortType, isReversed: boolean = false): (a: Tick, b: Tick) => number {
  const valueGetter = tickSortValueGetters[property];
  return (a, b) => (valueGetter(a) - valueGetter(b)) * (isReversed ? -1 : 1);
}

function getToday () {
  return Temporal.PlainDate.from(new Date().toISOString().split('T')[0]).dayOfYear
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
  #ticks?: Tick[]
  #ticksByYear?: Record<number, TickWrapper>
  #averageBasedPredictions: number[] = []
  #detailBasedPredictions: number[] = []
  constructor(dataWrapper: DataWrapper, orderedBy: TickSortType, direction: 'asc' | 'desc' = 'asc') {
    this.#dataWrapper = dataWrapper;
    this.#orderedBy = orderedBy;
    this.#direction = direction;
  }

  get ticks(): Tick[] {
    if (!this.#ticks) {
        this.#ticks = this.#dataWrapper.species.map(species => {
          const tick: Tick = {
            ...species,
            salientRecord: species.records[0]
          } as Tick;
          if (this.#orderedBy === 'lastSeen') {
            tick.salientRecord = species.records[species.records.length - 1];
          }
          return tick
        }).sort(getTickSorter(this.#orderedBy, this.#direction === 'desc'))
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

  getPredictionBasedOnAverage(dayOfYear: number = getToday()) {
    if (!this.#averageBasedPredictions[dayOfYear - 1]) {
      const thisYearTicks = this.ticksByYear[new Date().getFullYear()];
      const averageForThisDate = this.averageTickTally[dayOfYear - 1];
      const averageAtYearEnd = this.averageTickTally[364]
      this.#averageBasedPredictions[dayOfYear - 1] = Math.round(averageAtYearEnd + thisYearTicks.ticks.length - averageForThisDate);
    }
    return this.#averageBasedPredictions[dayOfYear - 1]
  }

  getPredictionBasedOnDetail(dayOfYear: number = getToday()) {
    if (!this.#detailBasedPredictions[dayOfYear - 1]) {
      const thisYearTicks = this.ticksByYear[new Date().getFullYear()];
      const thisYearScientificNames = thisYearTicks.ticks.map(tick => tick.scientificName)
      const futureTicksByYear = this.#dataWrapper.calve([row => {
        const rowDayOfYear = Temporal.PlainDate.from(row.date.toISOString().split('T')[0]).dayOfYear;
        return rowDayOfYear > (dayOfYear - 14) && !thisYearScientificNames.includes(row.scientificName)
      }]).getTicks('firstSeen').ticksFromComparableYears;

      const numberOfComparatorYears = Object.keys(futureTicksByYear).length;
      const allComparableTicks = Object.values(futureTicksByYear).flatMap(wrapper => wrapper.ticks)
      const comparableTickTallies: Record<ScientificName, number> = {};
      allComparableTicks.forEach(({  scientificName }) => {
        if (comparableTickTallies[scientificName]) {
          comparableTickTallies[scientificName]++;
        } else {
          comparableTickTallies[scientificName] = 1;
        }
      })
      let pastOneOffs = 0
      let expectation = thisYearTicks.ticks.length;
      Object.values(comparableTickTallies).forEach(pastTicksCount => {
        if (pastTicksCount === 1) {
          pastOneOffs++
        } else {
          expectation += pastTicksCount / numberOfComparatorYears
        }
      })

      expectation += (pastOneOffs / numberOfComparatorYears) * ((365 - dayOfYear) / 365)

      this.#detailBasedPredictions[dayOfYear - 1] = Math.round(expectation);
    }
    return this.#detailBasedPredictions[dayOfYear - 1]
  }

}



