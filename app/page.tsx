'use client'

/*
- Targets for next 4 weeks, for all regions
- Perf: Loading order
  - All time, year record and year so far for each list
  - Years line chart
  - Year and all time list
  - predictions and averages for each list tile
  - other charts
- Handle leap year
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
import { ListStatTiles } from './components/ListStatTiles';
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

function RegionDashboard({ allData, listId }: { allData: DataWrapper, listId: string }) {
  const allTimeData = allData.getDataForList(listId)
  const thisYear = new Date().getFullYear();
  const thisYearData = allTimeData.getDataForYear(thisYear)
  const allTimeTicks = allTimeData.getTicks('firstSeen', 'desc');
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
    getAllData().then(result => {
      setData(result as EbirdDataServerRow[])
    })
  }, [])


  return (
    <div>
      <h1>ebird dashboard</h1>
      <><ListStatTiles allTimeData={allTimeData} activeList={activeList} onSelectList={setActiveList}/>

        {data.length > 0 ? <RegionDashboard allData={allTimeData} listId={activeList} />: null}
        </>
    </div>
  );
}
