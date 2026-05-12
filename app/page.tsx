'use client'
import { getAllData } from "./actions/load-csv";
import type { EbirdDataRow } from "./models/types";
import {useEffect, useState} from 'react';
import { wrapData, DataWrapper } from './lib/data-wrapper';
import { getYearFilter, type EbirdDataFilter} from './lib/data-filters';
import type {TickWrapper} from './lib/ticks';
import { listConfigs } from './models/lists';
function TickList({ ticks, itemNumbersDescend}: { ticks: TickWrapper, itemNumbersDescend: boolean }) {
  // TODO: have some concept of how special a bird is
  return (
    <ol reversed={itemNumbersDescend ?? false} className="list-inside list-decimal">
      {ticks.ticks.map(tick => (
        <li className={`mb-2 ${tick.isSubspecies ? 'text-red-500' : ''}`} key={tick.scientificName}>
          {tick.commonName} - {tick.salientRecord?.date.toLocaleDateString()} - {tick.salientRecord?.location}
        </li>
      ))}
    </ol>
  )
}


function RegionStats({ name, id, filters, data }: { name: string, id: string, filters: EbirdDataFilter[], data: DataWrapper }) {
  const filteredData = data.calveForList(id);
  const ticksWrapper = filteredData.getTicks('firstSeen');
  const ticksByYear = ticksWrapper.ticksByYear;
  const thisYearTicks = ticksByYear[new Date().getFullYear()];
  let recordYear, recordYearTicks = 0;
  Object.entries(ticksByYear).forEach(([year, tickWrapper]) => {
    // we go with >= because if it's a tie, then show the most recent
    if (tickWrapper.ticks.length >= recordYearTicks) {
      recordYear = year
      recordYearTicks = tickWrapper.ticks.length;
    }
  });
  const averageTickTally = ticksWrapper.averageTickTally;
  const averageBasedPrediction = ticksWrapper.getPredictionBasedOnAverage();
  const detailBasedPrediction = ticksWrapper.getPredictionBasedOnDetail()
  return (
    <div className="stat">
      <div className="stat-desc">{name}</div>
      <div className="stat-value">{ticksWrapper.ticks.length}</div>
      <div className="stat-title">{recordYearTicks} in {recordYear} <span className="text-gray-400">({Math.round(averageTickTally[364])})</span></div>
      <div className="stat-title">{thisYearTicks.ticks.length} <span className="text-gray-400">({averageBasedPrediction} | {detailBasedPrediction})</span></div>
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

  // const allTimeTicks = allTimeData.getTicks('firstSeen');

  // const predictions = [...Array(365)].map(dayOfYear => {
  //   return data.length ? {
  //     detail: allTimeTicks.getPredictionBasedOnDetail(dayOfYear+1),
  //     average: allTimeTicks.getPredictionBasedOnAverage(dayOfYear+1),
  //   } : {}
  // })

  return (
    <div>
      <h1>ebird dashboard</h1>
      {data.length > 0 ? <><div className="w-full">
        <div className="join stats stats-border shadow-none">
          <div className="stat">
            <div className="stat-desc">Region</div>
            <div className="stat-value">All time</div>
            <div className="stat-title">Year record <span className="text-gray-400">(avg)</span></div>
            <div className="stat-title">This year <span className="text-gray-400">(predicted)</span></div>
          </div>
          {/*
            TODO: Then can memoise the filters
            TODO: Low carbon.
            */}
          {listConfigs.map(config => <RegionStats key={config.id} {...config} data={allTimeData} />)}


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
        {/* <ul>
          {predictions.map(({detail, average}) => <li>{detail}: {average}</li>)}
        </ul> */}
        </> : null}
    </div>
  );
}
