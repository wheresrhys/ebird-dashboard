'use client'

/*
- Handle leap year
- store day of year on ticks
- squished bar chart (like a DNA result) showing a vertical line for every tick coloured by rarity
- doughnut charts should be scaled according to the biggest year, so that the wedges mean the same number of birds in each chart. I want to be able to say 'in this year I saw more or less common birds than year x'
- Maybe donut isn't the right paradigm, it shoudl be more like a horizontal stacked bar, and clicking a button allows them to be stacked as lines in chronological order - YES!!!
- ANNNNND the chronoligical order ones could also be plotted with accurate time intervals between ticks. So the cool UI is
  - shows horizontal stacked bar chart of rarities
  - click once and it reorders them so that each tick is an individual vertical line
  - click again and it spreads them out so that each horizontal pixel is a day of the year and we get a sparse set of coloured vertical lines
  - ALso think of how to visually represent when a tick was an actual lifer at the time!
- ticks per year (per list)
- Put everything in promises and useEffect to mak erendering mroe incremental
- Page showing all regions in detail for a year
 - quality ticks per year (per list) see https://docs.google.com/spreadsheets/d/1Zn7RP9e3mSVDGg0LZHWVO4q2gp1YxbGVQO1AZrLHUWE/edit?gid=713428706#gid=713428706
 - matrix of lists totals
 - star birds
  - split ticks for year from ticks for all years classes. both extend a shared thing
 - comparison of years matrix
 - predict which birds I am likely to get and which I am running out of time to get
 - Gardens and seymour road lists
 - search for/click on a species and get EVERYTHING on it
 - for each non-common species, plot which years it appears for

 - TODO - aggregate best ticks periods
  - when do I get most of my lifers
  - add lines to the rarity by date that
    - says when all life ticks are
    - another that just collects all the year dots on a single line (need to think about decluttering though)
- stop accepting filters - not needed. then can make everything memoised by default on year and region combo
- Also make stacked rarity charts available as proportion
- chart comparing all lists for a year (or for all time) in a line
*/
import { getAllData } from "./actions/load-csv";
import type { EbirdDataServerRow } from "./models/types";
import {useEffect, useState} from 'react';
import { wrapServerData, DataWrapper } from './lib/data-wrapper';
import { RARITY_CLASSIFICATIONS, type TickWrapper} from './lib/ticks';
import { listConfigs } from './models/lists';
import YearsLineChart from './components/YearsLineChart'
import RarityBucketsChart from "./components/RarityBucketsChart";
import TickYearScatterChart from "./components/TickYearScatterChart";
function TickList({ ticks, itemNumbersDescend}: { ticks: TickWrapper, itemNumbersDescend: boolean }) {
  // TODO: have some concept of how special a bird is
  return (
    <ol reversed={itemNumbersDescend ?? false} className="list-inside list-decimal">
      {ticks.ticksWithRarity.map(tick => (
        <li className={`mb-2 ${tick.isSubspecies ? 'text-italic' : ''}`} key={tick.scientificName}>
          <span className={`w-4 h-4 inline-block ${RARITY_CLASSIFICATIONS[tick.rarityClassification].tailwindColour}`}></span>{tick.commonName} - {tick.salientRecord?.date.toString()} - {tick.salientRecord?.location} {tick.salientRecord.submissionId}
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
  const { recordYear, recordYearTicks } = ticksWrapper.recordTicksAndYear;
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
  const thisYearData = allTimeData.getDataForYear(thisYear)
  const allTimeTicks = allTimeData.getTicks('firstSeen');

  return <div>
    <YearsLineChart ticks={allTimeTicks} />
    <RarityBucketsChart ticks={allTimeTicks} />
    <TickYearScatterChart ticks={allTimeTicks} />
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
  const [data, setData]: [EbirdDataServerRow[], (data: EbirdDataServerRow[]) => void] = useState<EbirdDataServerRow[]>([])
  const [activeList, setActiveList] = useState(listConfigs[0].id)
  const allTimeData = wrapServerData(data);

  useEffect(() => {
    getAllData().then(result => setData(result as EbirdDataServerRow[]))
  }, [])


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
