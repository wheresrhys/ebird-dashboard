import { EbirdDataRow, Species, ScientificName } from "../models/types";
import { type DataWrapper, DataWrapperOptions } from './data-wrapper';
import { Temporal } from 'temporal-polyfill';
import { SimpleCache } from "./simple-cache";

const FIRST_PROPER_EBIRD_YEAR = 2021;

export type Tick = Omit<Species, 'records'> & {
  salientRecord: EbirdDataRow;
}

export type RarityLabel = string;
type HSL = string;
type RarityConfig = {
  chartColour: HSL,
  tailwindColour: string
}
export type TickWithRarity = Tick & {
  rarityClassification: RarityLabel
}

export type TickSortType = 'taxonomicOrder' | 'firstSeen' | 'lastSeen';

const tickSorters: Record<TickSortType, (t1: Tick, t2: Tick) => number> = {
  taxonomicOrder: (t1: Tick, t2: Tick) => t1.taxonomicOrder - t2.taxonomicOrder,
  firstSeen: (t1: Tick, t2: Tick) => Temporal.PlainDate.compare(t1.salientRecord.date, t2.salientRecord.date),
  lastSeen: (t1: Tick, t2: Tick) => -Temporal.PlainDate.compare(t1.salientRecord.date, t2.salientRecord.date),
}

export const RARITY_CLASSIFICATIONS: Record<RarityLabel, RarityConfig> = {
  "Oh Wow x3": {
    chartColour: "hsl(0 92% 52%)",
    tailwindColour: 'bg-red-600'
  },
  "Blimey": {
    chartColour: "hsl(20 92% 54%)",
    tailwindColour: 'bg-orange-600'
  },
  "Pretty Special": {
    chartColour: "hsl(38 94% 52%)",
    tailwindColour: 'bg-amber-600'
  },
  "Very nice" : {
    chartColour: "hsl(48 96% 56%)",
    tailwindColour: 'bg-yellow-300'
  },
  "Nice": {
    chartColour: "hsl(136 62% 42%)",
    tailwindColour: 'bg-lime-500'
  },
  "Tweet": {
    chartColour: "hsl(217 88% 52%)",
    tailwindColour: 'bg-blue-500'
  },
}

export const RARITY_LABELS = Object.keys(RARITY_CLASSIFICATIONS)

export function getRarityLabels(yearCount: number): string[] {
  if (yearCount < 6) {
    return RARITY_LABELS.filter(type => type !== 'Very nice')
  }

  return [...Array(yearCount)].map((_, i) =>
    RARITY_LABELS[
    Math.floor((RARITY_LABELS.length) * (i /yearCount))
    ],
  );
}

function getTickSorter(property: TickSortType, isReversed: boolean = false): (a: Tick, b: Tick) => number {
  const sorter = tickSorters[property];
  return (a, b) => sorter(a, b) * (isReversed ? -1 : 1);
}

function getToday () {
  return Temporal.PlainDate.from(Temporal.Now.plainDateISO()).dayOfYear
}

function listComparableYears (): number[] {
  const years = [];
  const thisYear = new Date().getFullYear();
  let year = FIRST_PROPER_EBIRD_YEAR
  while (year < thisYear) {
    years.push(year);
    year++;
  }
  return years;
}

export function excludeNonComparableYears<T>(dataByYear: Record<number, T>): Record<number, T> {
  const comparableYears = listComparableYears();
  return Object.fromEntries(Object.entries(dataByYear).filter(([year]) => comparableYears.includes(Number(year))));
}

//todo memoize
export function buildTickTally(tickWrapper: TickWrapper, terminateToday: boolean = false): number[] {
  const tickTimings = tickWrapper.ticks.map(tick =>
    tick.salientRecord.date.dayOfYear)
  let lastDate = 365;
  if (terminateToday) {
    lastDate = getToday()
  }

  let ticksSoFar = 0;

  // TDOD why doesn't this work for the line chart???
  // let tickIterator = 0;

  // const tickies = [...Array(lastDate)]
  //   .map((_, index) => {
  //     while (tickTimings[tickIterator] === index + 1) {
  //       tickIterator++;
  //       ticksSoFar++;
  //     }
  //     return ticksSoFar
  //   });

  // return tickies;
  const ticksPerDay = [...Array(lastDate)].map((_, index) =>
    tickTimings.filter(timing => timing === index + 1).length);

  return ticksPerDay.map(ticks => {
    ticksSoFar += ticks;
    return ticksSoFar;
  })
}

type TickWrapperOptions = {
  orderedBy: TickSortType,
  direction: 'asc' | 'desc'
}

export class TickWrapper {
  #dataWrapper: DataWrapper
  #orderedBy: TickSortType
  #direction: 'asc' | 'desc'
  #ticks?: Tick[]
  #tickCount?: number
  #averageBasedPredictions: number[] = []
  #detailBasedPredictions: number[] = []
  #speciesFrequencies?: Record<ScientificName, number>
  #ticksWithRarity?: TickWithRarity[]
  #rarityBuckets?: Record<RarityLabel, number>
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

  get tickCount() {
    if (!this.#tickCount) {
      this.#tickCount = this.#dataWrapper.species.length
    }
    return this.#tickCount
  }

  get allTimeTicks(): TickWrapper {
    return this.#dataWrapper.allTimeData.getTicks(this.#orderedBy, this.#direction)
  }

  getTicksForYear(year: number) {
    return this.#dataWrapper.getDataForYear(year).getTicks(this.#orderedBy, this.#direction)
  }

  get ticksByYear(): Record<number, TickWrapper> {
    return Object.fromEntries(this.#dataWrapper.availableYears.map((year) => [year, this.getTicksForYear(year)]));
  }

  get ticksFromComparableYears(): Record<number, TickWrapper> {
    return excludeNonComparableYears(this.ticksByYear)
  }

  get comparableYears(): number[] {
    return Object.keys(this.ticksFromComparableYears).map(key => parseInt(key, 10))
  }

  get averageTickTally(): number[] {
    const comparatorYears = this.ticksFromComparableYears;
    const talliesMatrix = Object.values(comparatorYears).map(ticks => buildTickTally(ticks));
    return talliesMatrix[0].map((_, index) => talliesMatrix.map(tally => tally[index]).reduce((acc, tally) => acc + tally, 0) / talliesMatrix.length)
  }

  getPredictionBasedOnAverage(dayOfYear: number = getToday()) {
    if (!this.#averageBasedPredictions[dayOfYear - 1]) {
      const thisYearTicks = this.getTicksForYear(new Date().getFullYear());
      const averageForThisDate = this.averageTickTally[dayOfYear - 1];
      const averageAtYearEnd = this.averageTickTally[364]
      this.#averageBasedPredictions[dayOfYear - 1] = Math.round(averageAtYearEnd + thisYearTicks.ticks.length - averageForThisDate);
    }
    return this.#averageBasedPredictions[dayOfYear - 1]
  }

  getPredictionBasedOnDetail(dayOfYear: number = getToday()) {
    if (!this.#detailBasedPredictions[dayOfYear - 1]) {
      const thisYearTicks = this.getTicksForYear(new Date().getFullYear());
      const thisYearScientificNames = thisYearTicks.ticks.map(tick => tick.scientificName)
      // is this the most efficient way of getting this?
      // coul do ticks('lastSeen') first as it's more cachable, and then filter that?
      // woudl entail storing dayOfYear on ticks first
      // or could apply filter first... hmm coudl all filtered sets initialise their own cache?
      // ... if this.isFiltered this.cache = blah
      const futureTicksByYear = this.#dataWrapper.filter(row => {
        const rowDayOfYear = row.date.dayOfYear;
        return rowDayOfYear > (dayOfYear - 14) && !thisYearScientificNames.includes(row.scientificName)
      }).getTicks('firstSeen').ticksFromComparableYears;

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

  get speciesFrequencies() {
    if (!this.#speciesFrequencies) {

      const speciesFrequencies: Record<ScientificName, number> = {}
      Object.values(this.ticksFromComparableYears)
        .flatMap(wrapper => wrapper.ticks)
        .forEach(({ scientificName }) => {
          speciesFrequencies[scientificName] = speciesFrequencies[scientificName] || 0
          speciesFrequencies[scientificName]++;
        });
      this.#speciesFrequencies = speciesFrequencies
    }
    return this.#speciesFrequencies
  }

  get ticksWithRarity (): TickWithRarity[] {
    if (!this.#ticksWithRarity) {
      const speciesFrequencies = this.allTimeTicks.speciesFrequencies;
      const numberOfComparableYears = listComparableYears().length;
      const rarityLabels = getRarityLabels(numberOfComparableYears);
      this.#ticksWithRarity = this.ticks.map(tick => ({
          ...tick,
        rarityClassification: rarityLabels[ (speciesFrequencies[tick.scientificName] ?? 1) - 1]
      }))
    }
    return this.#ticksWithRarity
  }

  get rarityBuckets () {
    if (!this.#rarityBuckets) {
      const rarityBuckets: Record<RarityLabel, number> = {};
      this.ticksWithRarity.forEach(tick => {
         rarityBuckets[tick.rarityClassification] = rarityBuckets[tick.rarityClassification] || 0;
         rarityBuckets[tick.rarityClassification]++
      })
      this.#rarityBuckets = rarityBuckets;
    }
    return this.#rarityBuckets
  }

  get recordTicksAndYear () {
    let recordYear, recordYearTicks = 0;
    Object.entries(this.ticksByYear).forEach(([year, tickWrapper]) => {
      // we go with >= because if it's a tie, then show the most recent
      if (tickWrapper.tickCount >= recordYearTicks) {
        recordYear = year
        recordYearTicks = tickWrapper.tickCount;
      }
    });
    return { recordYear, recordYearTicks }
  }


  static construct(dataWrapper: DataWrapper, orderedBy: TickSortType, direction: 'asc' | 'desc') {
    const cacheOptions = { ...dataWrapper.options, orderedBy, direction }
    if (!TickWrapper.cache.getItem(cacheOptions)) {
      TickWrapper.cache.setItem(cacheOptions, new TickWrapper(dataWrapper, orderedBy, direction))
    }
    return TickWrapper.cache.getItem(cacheOptions)
  }

  static cache = new SimpleCache<TickWrapper, TickWrapperOptions>(
    ({
      listId,
      year,
      orderedBy,
      direction
    }: DataWrapperOptions & TickWrapperOptions) => `${listId ?? 'no-list'}:${year ? String(year) : 'no-year'}:${orderedBy}:${direction}`);
}



