'use client'

/*
 - ticks per year (per list)
 - quality ticks per year (per list) see https://docs.google.com/spreadsheets/d/1Zn7RP9e3mSVDGg0LZHWVO4q2gp1YxbGVQO1AZrLHUWE/edit?gid=713428706#gid=713428706
 - charts
 - improve ticks by year to generate individually and popoulate an already extant object
 - matrix of lists totals
 - star birds
 - PieChart of commonality of birds - comparison between years
 - comparison of years matrix
 - predict which birds I am likely to get and which I am runnig out of time to get
 - Gardens and seymour road lists
 - search for/click on a species and get EVERYTHING on it
*/
import { getAllData } from "./actions/load-csv";
import type { EbirdDataRow } from "./models/types";
import {useEffect, useState} from 'react';
import { wrapData, DataWrapper } from './lib/data-wrapper';
import { getYearFilter } from './lib/data-filters';
import type {TickWrapper} from './lib/ticks';
import { listConfigs } from './models/lists';
import { YearsChart } from './components/Charts'
function TickList({ ticks, itemNumbersDescend}: { ticks: TickWrapper, itemNumbersDescend: boolean }) {
  // TODO: have some concept of how special a bird is
  return (
    <ol reversed={itemNumbersDescend ?? false} className="list-inside list-decimal">
      {ticks.ticks.map(tick => (
        <li className={`mb-2 ${tick.isSubspecies ? 'text-red-500' : ''}`} key={tick.scientificName}>
          {tick.commonName} - {tick.salientRecord?.date.toLocaleDateString()} - {tick.salientRecord?.location} {tick.salientRecord.submissionId}
        </li>
      ))}
    </ol>
  )
}


function RegionStats({ name, id, data, onSelect, isSelected }: { name: string, id: string, data: DataWrapper, onSelect: (id: string) => void, isSelected: boolean }) {
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
  const detailBasedPrediction = ticksWrapper.getPredictionBasedOnDetail();

  return (
    <div className={`stat ${isSelected ? 'bg-gray-100' : ''} cursor-pointer`} onClick={() => onSelect(id)}>
      <div className="stat-desc">{name}</div>
      <div className="stat-value">{ticksWrapper.ticks.length}</div>
      <div className="stat-title">{recordYearTicks} in {recordYear} <span className="text-gray-400">({Math.round(averageTickTally[364])})</span></div>
      <div className="stat-title">{thisYearTicks.ticks.length} <span className="text-gray-400">({averageBasedPrediction} | {detailBasedPrediction})</span></div>
    </div>
  )
}

function RegionDashboard({ allData, listId }: { allData: DataWrapper, listId: string }) {
  const allTimeData = allData.calveForList(listId)
  const thisYear = new Date().getFullYear();
  const thisYearData = allTimeData.calve([getYearFilter(thisYear)])
  const allTimeTicks = allTimeData.getTicks('firstSeen');

  return <div>
    <YearsChart ticks={allTimeTicks} />
    <div className="flex">
    <div className="w-half">
      <h2>Year list</h2>
      <TickList ticks={thisYearData.getTicks('firstSeen', 'desc')} itemNumbersDescend={true} />
    </div>
    <div className="w-half">
      <h2>Life list</h2>
      <TickList ticks={allTimeData.getTicks('firstSeen', 'desc')} itemNumbersDescend={true} />
    </div>
  </div></div>
}


export default function Home() {
  const [data, setData]: [EbirdDataRow[], (data: EbirdDataRow[]) => void] = useState<EbirdDataRow[]>([])
  const [activeList, setActiveList] = useState(listConfigs[0].id)
  const allTimeData = wrapData(data);

  useEffect(() => {
    getAllData().then(result => setData(result as EbirdDataRow[]))
  }, [])




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
          {listConfigs.map(config => <RegionStats key={config.id} {...config} data={allTimeData} onSelect={setActiveList} isSelected={config.id === activeList}/>)}


        </div>
      </div>


        <RegionDashboard allData={allTimeData} listId={activeList} />
        </> : null}
    </div>
  );
}
