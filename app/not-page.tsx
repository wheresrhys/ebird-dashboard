import { getTicksList } from '../lib/ticks-list';
import { createDb } from '../models/create-db';
import { getYear } from '../models/load-csv';
import { Temporal } from 'temporal-polyfill';


export default function Home() {
  const db = createDb(getYear(2024));
  const ticksList = getTicksList(db);
  const tickTimings = ticksList.map(tick =>
    Temporal.PlainDate.from(tick.date.toISOString().split('T')[0]).dayOfYear)
  const ticksPerDay = [...Array(365)].map((_, index) =>
    tickTimings.filter(timing => timing === index + 1).length);
  let ticksSoFar = 0
  const graphHeights = ticksPerDay.map(ticks => {
    ticksSoFar += ticks;
    return ticksSoFar;
  })
  return (
   <div className="m-4"><div className="flex w-10 h-100">
      {graphHeights.map((height, index) => (
        <div key={index} className="content-end">
          <div className="bg-blue-500 w-1" style={{ height: `${100 * height/ticksSoFar}%` }}></div>
        </div>
      ))}
    </div>
    <ol className="list-decimal list-inside">
      {ticksList.map(tick => (
        <li key={tick.submissionId}>
          {tick.species.commonName} - {tick.date.toLocaleDateString()} - {tick.location.location}
        </li>
      ))}
    </ol>
    </div>
  );
}
