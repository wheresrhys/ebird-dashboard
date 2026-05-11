import { getTicksWithFilters, getTicksByYear, type Tick } from './lib/ticks';
import { getYearFilter, type EBirdDataFilter } from '../lib/data-filters';
import { getAverageTickTally, getPredictionBasedOnYearlyAverage } from './lib/avg-utilities'
import { getPredictionBasedOnDetail } from './lib/prediction-detail';

// Can also plot an average / median amount at this date graph

// Do best ever days, weeks, monthss
// For total species and total significant species


function RegionStats({name, filters}: {name: string, filters: EBirdDataFilter[]}) {
  const allTimeTicks = getTicksWithFilters(filters, 'date');
  const ticksByYear = getTicksByYear(filters, 'date');
  const thisYearTicks = ticksByYear[new Date().getFullYear()];
  const recordYearTicks = Math.max(...Object.values(ticksByYear).map(ticks => ticks.length));
  const averageTickTally = getAverageTickTally(ticksByYear);
  const averageBasedPrediction = getPredictionBasedOnYearlyAverage(filters);
  const detailBasedPrediction = getPredictionBasedOnDetail(filters)
  return (
    <div className="stat">
      <div className="stat-desc">{name}</div>
      <div className="stat-value">{allTimeTicks.length}</div>
      <div className="stat-title">{recordYearTicks} <span className="text-gray-400">({Math.round(averageTickTally[364])})</span></div>
      <div className="stat-title">{thisYearTicks.length}{' '}<span className="text-gray-400">({averageBasedPrediction} | {detailBasedPrediction})</span></div>
    </div>
  )
}



export default function Home() {
  const thisYear = new Date().getFullYear();
  const allTimeTicks = getTicksWithFilters([], 'taxonomicOrder')
  const thisYearTicks = getTicksWithFilters([getYearFilter(thisYear)], 'date');
  return (
    <div>
      <h1>ebird dashboard</h1>
      <div className="w-full">
        <div className="join stats stats-border shadow-none">
          <div className="stat">
            <div className="stat-desc">Region</div>
            <div className="stat-value">All time</div>
            <div className="stat-title">Year record <span className="text-gray-400">(avg)</span></div>
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
        <TickList ticks={thisYearTicks} />
      </div>
      <div className="w-half">
        <h2>Life list</h2>
        <TickList ticks={allTimeTicks} />
      </div>
      </div>
    </div>
  );
}
