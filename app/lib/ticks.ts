import { EbirdDataRow, Species } from "../models/data";
import { Temporal } from 'temporal-polyfill';

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

export function buildTickTally(ticks: Tick[]): number[] {
  const tickTimings = ticks.map(tick =>
    Temporal.PlainDate.from(tick.salientRecord.date.toISOString().split('T')[0]).dayOfYear)
  const ticksPerDay = [...Array(365)].map((_, index) =>
    tickTimings.filter(timing => timing === index + 1).length);
  let ticksSoFar = 0
  return ticksPerDay.map(ticks => {
    ticksSoFar += ticks;
    return ticksSoFar;
  })
}







