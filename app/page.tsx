'use client'
import { getAllData } from "./actions/load-csv";
import type { EbirdDataRow } from "./models/data";
import {useEffect, useState} from 'react';
import { wrapData, FilteredDataWrapper } from './lib/data-wrapper';
import { getYearFilter} from './lib/data-filters';
import type {Tick} from './lib/ticks';

function TickList({ ticks, itemNumbersDescend}: { ticks: Tick[], itemNumbersDescend: boolean }) {
  // TODO: have some concept of how special a bird is
  return (
    <ol reversed={itemNumbersDescend ?? false} className="list-inside list-decimal">
      {ticks.map(tick => (
        <li className={`mb-2 ${tick.species.isSubspecies ? 'text-red-500' : ''}`} key={tick.species.scientificName}>
          {tick.species.commonName} - {tick.salientRecord?.date.toLocaleDateString()} - {tick.salientRecord?.location}
        </li>
      ))}
    </ol>
  )
}


function RegionStats({ name, filters, data }: { name: string, filters: EbirdDataFilter[], data: FilteredDataWrapper }) {
  const filteredData = data.calve(filters);
  const allTimeTicks = filteredData.getTicks('firstSeen');
  const ticksByYear = filteredData.getTicksByYear('firstSeen');
  const thisYearTicks = ticksByYear[new Date().getFullYear()];
  const recordYearTicks = Math.max(...Object.values(ticksByYear).map(ticks => ticks.length));
  // const averageTickTally = getAverageTickTally(ticksByYear);
  // const averageBasedPrediction = getPredictionBasedOnYearlyAverage(filters);
  // const detailBasedPrediction = getPredictionBasedOnDetail(filters)
  return (
    <div className="stat">
      <div className="stat-desc">{name}</div>
      <div className="stat-value">{allTimeTicks.length}</div>
      <div className="stat-title">{recordYearTicks}
        {/* <span className="text-gray-400">({Math.round(averageTickTally[364])})</span> */}
        </div>
      <div className="stat-title">{thisYearTicks.length}
        {/* <span className="text-gray-400">({averageBasedPrediction} | {detailBasedPrediction})</span> */}
        </div>
    </div>
  )
}


export default function Home() {
  const [data, setData]: [EbirdDataRow[], (data: EbirdDataRow[]) => void] = useState<EbirdDataRow[]>([])
  useEffect(() => {
    getAllData().then(result => setData(result as EbirdDataRow[]))
  }, [])
  const thisYear = new Date().getFullYear();
  const allTimeData = wrapData(data);
  const thisYearData = allTimeData.calve([getYearFilter(thisYear)])

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
          <RegionStats name="UK" filters={[]} data={allTimeData}/>
          <RegionStats name="London" filters={[row => row.county === 'London']} data={allTimeData}/>
          <RegionStats name="WiderPatch" filters={[row =>
            ['L12106041', 'L1236726', 'L2083779', 'L8046904', 'L11781329', 'L12107169', 'L5850700', 'L1349703', 'L6820003', 'L8933164', 'L15798703', 'L12106406', 'L12106053'].includes(row.locationId)
          ]} data={allTimeData}/>
          <RegionStats name="Wetlands" filters={[row =>
            ['L2083779'].includes(row.locationId)
          ]} data={allTimeData}/>
          <RegionStats name="Marshes" filters={[row =>
            ['L1236726', 'L12106041'].includes(row.locationId)
          ]} data={allTimeData}/>
          <RegionStats name="Lizard" filters={[row =>
            ['L8046904'].includes(row.locationId)
          ]} data={allTimeData}/>

        </div>
      </div>
      <div className="flex">
        <div className="w-half">
          <h2>Year list</h2>
          <TickList ticks={thisYearData.getTicks('firstSeen', 'desc')} itemNumbersDescend={true} />
        </div>
        <div className="w-half">
          <h2>Life list</h2>
          <TickList ticks={allTimeData.getTicks('firstSeen', 'desc')} itemNumbersDescend={true} />
        </div>
      </div>
    </div>
  );
}
