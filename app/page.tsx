'use client'
import { getAllData } from "./actions/load-csv";
import type { EbirdDataRow } from "./models/data";
import {useEffect, useState} from 'react';
import { wrapData } from './lib/data-wrapper';
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
      <p>{data.length} records</p>
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
