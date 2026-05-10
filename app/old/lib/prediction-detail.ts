import { getTicksWithFilters, getTicksByYear, excludeNonComparableYears, type Tick } from './ticks';
import type { ScientificName } from '@/app/models/data';
import { Temporal } from 'temporal-polyfill';
import { getYearFilter, type EBirdDataFilter } from './data-filters';


export function getPredictionBasedOnDetail(filters: EBirdDataFilter[]) {
  const thisYearTicks = getTicksWithFilters([...filters, getYearFilter(new Date().getFullYear())], 'date');
  const thisYearScientificNames = thisYearTicks.map(tick => tick.species.scientificName)
  const todayAsDayOfYear = Temporal.PlainDate.from(new Date().toISOString().split('T')[0]).dayOfYear;
  const futureTicksByYear = getTicksByYear([...filters, row => {
    const rowDayOfYear = Temporal.PlainDate.from(row.date.toISOString().split('T')[0]).dayOfYear;
    return rowDayOfYear > (todayAsDayOfYear - 14) && !thisYearScientificNames.includes(row.scientificName)
  }], 'date')

  const comparatorYears = excludeNonComparableYears(futureTicksByYear);

  const numberOfComparatorYears = Object.values(comparatorYears).length;
  const allComparableTicks = Object.values(comparatorYears).flatMap(tick => tick)
  const comparableTickTallies: Record<ScientificName, number> = {};
  allComparableTicks.forEach(({species: {scientificName}}) => {
    if (comparableTickTallies[scientificName]) {
      comparableTickTallies[scientificName]++;
    } else {
      comparableTickTallies[scientificName] = 1;
    }
  })
  let pastOneOffs = 0
  let expectation = thisYearTicks.length;
  Object.values(comparableTickTallies).forEach(pastTicksCount => {
    if (pastTicksCount === 1) {
      pastOneOffs++
    } else {
      expectation += pastTicksCount / numberOfComparatorYears
    }
  })

  expectation += (pastOneOffs / numberOfComparatorYears) * ((365 - todayAsDayOfYear)/365)

  return Math.round(expectation);
}
