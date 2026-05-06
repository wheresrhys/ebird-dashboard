import { getTicks, type Tick } from '../lib/ticks';
import { createDb } from '../models/create-db';
import { listAvailableYears } from '../models/load-csv';
import { filterData, getYearFilter, type EBirdDataFilter } from '../lib/data-filters';
import { Temporal } from 'temporal-polyfill';

const FIRST_PROPER_EBIRD_YEAR = 2020;

function getTicksWithFilters(filters: EBirdDataFilter[]): Tick[] {
  const records = filterData(filters);
  const db = createDb(records);
  return getTicks(db);
}

function getTicksByYear(filters: EBirdDataFilter[]): Record<number, Tick[]> {
  const listOfYears = listAvailableYears();
  return Object.fromEntries(listOfYears.map(year => [year,getTicksWithFilters([...filters, getYearFilter(year)])]));
}

function excludeNonComparableYears(ticksByYear: Record<number, Tick[]>): Record<number, Tick[]> {
  const thisYear = new Date().getFullYear();
  return Object.fromEntries(Object.entries(ticksByYear).filter(([year, ticks]) => Number(year) >= FIRST_PROPER_EBIRD_YEAR && Number(year) <= thisYear));
}

function buildTickTally(ticks: Tick[]): number[] {
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

function getAverageTickTally(ticksByYear: Record<number, Tick[]>): number[] {
  const talliesMatrix = Object.values(ticksByYear).map(buildTickTally);
  return talliesMatrix[0].map((_, index) => talliesMatrix.map(tally => tally[index]).reduce((acc, tally) => acc + tally, 0) / talliesMatrix.length)
}

function getPredictionBasedOnYearlyAverage(ticks: Tick[], averageTickTally: number[]): number {
  const todayAsDayOfYear = Temporal.PlainDate.from(new Date().toISOString().split('T')[0]).dayOfYear;
  const averageForThisDate = averageTickTally[todayAsDayOfYear - 1];
  const averageAtYearEnd = averageTickTally[364]
  return Math.round(averageAtYearEnd + ticks.length - averageForThisDate);
}


function RegionStats({name, filters}: {name: string, filters: EBirdDataFilter[]}) {
  const allTimeTicks = getTicksWithFilters(filters);
  const ticksByYear = getTicksByYear(filters);
  const thisYearTicks = ticksByYear[new Date().getFullYear()];
  const recordYearTicks = Math.max(...Object.values(ticksByYear).map(ticks => ticks.length));
  const comparatorYears = excludeNonComparableYears(ticksByYear);
  const averageTickTally = getAverageTickTally(comparatorYears);
  const prediction = getPredictionBasedOnYearlyAverage(thisYearTicks, averageTickTally);
  return (
    <div className="stat">
      <div className="stat-desc">{name}</div>
      <div className="stat-value">{allTimeTicks.length}</div>
      <div className="stat-title">{recordYearTicks}</div>
      <div className="stat-title">{thisYearTicks.length}{' '}<span className="text-gray-400">({prediction})</span></div>
    </div>
  )
}

export default function Home() {
  const thisYear = new Date().getFullYear();
  const allTimeTicks = getTicksWithFilters([]).sort((a, b) => a.species.taxonomicOrder - b.species.taxonomicOrder);
  const thisYearTicks = getTicksWithFilters([getYearFilter(thisYear)]);
  return (
    <div>
      <h1>ebird dashboard</h1>
      <div className="w-full">
        <div className="join stats stats-border shadow-none">
          <div className="stat">
            <div className="stat-desc">Region</div>
            <div className="stat-value">All time</div>
            <div className="stat-title">Year record</div>
            <div className="stat-title">This year <span className="text-gray-400">(predicted)</span></div>
          </div>
          <RegionStats name="UK" filters={[]} />
          <RegionStats name="London" filters={[row => row.county === 'London']} />
          <RegionStats name="WiderPatch" filters={[row =>
            ['L12106041', 'L1236726', 'L2083779', 'L8046904', 'L11781329', 'L12107169', 'L5850700', 'L1349703', 'L6820003', 'L8933164', 'L15798703', 'L12106406', 'L12106053'].includes(row.locationId)
          ]} />
          <RegionStats name="Wetlands" filters={[row =>
            ['L2083779'].includes(row.locationId)
          ]} />
          <RegionStats name="Marshes" filters={[row =>
            ['L1236726', 'L12106041'].includes(row.locationId)
          ]} />
          <RegionStats name="Lizard" filters={[row =>
            ['L8046904'].includes(row.locationId)
          ]} />

        </div>
      </div>
      <div className="flex">
      <div className="w-half">
        <h2>Year list</h2>
        <ol className="list-inside list-decimal">
          {/* // TODO: have some concept of how special a bird is */}
          {thisYearTicks.map(tick => (
            <li className="mb-2" key={tick.species.taxonomicOrder}>
              {tick.species.commonName} - {tick.date.toLocaleDateString()} - {tick.location.location}
            </li>
          ))}
        </ol>
      </div>
      <div className="w-half">
        <h2>Life list</h2>
        <ol className="list-inside list-decimal">
          {allTimeTicks.map(tick => (
            <li className="mb-2" key={tick.species.taxonomicOrder}>
                      {tick.species.commonName} ({tick.species.taxonomicOrder}) - {tick.date.toLocaleDateString()} - {tick.location.location}
                    </li>
                  ))}
        </ol>
      </div>
      </div>
    </div>
  );
}
