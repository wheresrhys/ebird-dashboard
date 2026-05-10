import { getTicksByYear, excludeNonComparableYears, type Tick } from './ticks';

import { Temporal } from 'temporal-polyfill';
import { type EBirdDataFilter } from './data-filters';

export function buildTickTally(ticks: Tick[]): number[] {
  const tickTimings = ticks.map(tick =>
    Temporal.PlainDate.from(tick.date.toISOString().split('T')[0]).dayOfYear)
  const ticksPerDay = [...Array(365)].map((_, index) =>
    tickTimings.filter(timing => timing === index + 1).length);
  let ticksSoFar = 0
  return ticksPerDay.map(ticks => {
    ticksSoFar += ticks;
    return ticksSoFar;
  })
}

export function getAverageTickTally(ticksByYear: Record<number, Tick[]>): number[] {
  const comparatorYears = excludeNonComparableYears(ticksByYear);
  const talliesMatrix = Object.values(comparatorYears).map(buildTickTally);
  return talliesMatrix[0].map((_, index) => talliesMatrix.map(tally => tally[index]).reduce((acc, tally) => acc + tally, 0) / talliesMatrix.length)
}

export function getPredictionBasedOnYearlyAverage(filters: EBirdDataFilter[]): number {
  const ticksByYear = getTicksByYear(filters, 'date');
  const thisYearTicks = ticksByYear[new Date().getFullYear()];
  const comparatorYears = excludeNonComparableYears(ticksByYear);
  const averageTickTally = getAverageTickTally(comparatorYears);
  const todayAsDayOfYear = Temporal.PlainDate.from(new Date().toISOString().split('T')[0]).dayOfYear;
  const averageForThisDate = averageTickTally[todayAsDayOfYear - 1];

  const averageAtYearEnd = averageTickTally[364]
  return Math.round(averageAtYearEnd + thisYearTicks.length - averageForThisDate);
}
