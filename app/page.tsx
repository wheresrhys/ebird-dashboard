import { getTicksList } from '../lib/ticks-list';
import { createDb } from '../models/create-db';
import { getYear, getAll } from '../models/load-csv';
import { Temporal } from 'temporal-polyfill';


export default function Home() {
  const allTimeDb = createDb(getAll());
  const allTimeTicks = getTicksList(allTimeDb);
  const thisYearDb = createDb(getYear(new Date().getFullYear() - 1));
  const thisYearTicks = getTicksList(thisYearDb);

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
          <div className="stat">
            <div className="stat-desc">UK</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
          <div className="stat">
            <div className="stat-desc">London</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
          <div className="stat">
            <div className="stat-desc">Marshes</div>
            <div className="stat-value">76,250</div>
            <div className="stat-title">308</div>
            <div className="stat-title">150 <span className="text-gray-400">(200)</span></div>
          </div>
        </div>
      </div>
      <div className="flex">
      <div className="w-half">
        <h2>Year list</h2>
        <ol className="list-inside list-decimal">
          {/* TODO: have some concept of how special a bird is */}
          {thisYearTicks.map(tick => (
            <li className="mb-2" key={tick.submissionId}>
              {tick.species.commonName} - {tick.date.toLocaleDateString()} - {tick.location.location}
            </li>
          ))}
        </ol>
      </div>
      <div className="w-half">
        <h2>Life list</h2>
        <ol className="list-inside list-decimal">
          {allTimeTicks.map(tick => (
            <li className="mb-2" key={tick.submissionId}>
                      {tick.species.commonName} - {tick.date.toLocaleDateString()} - {tick.location.location}
                    </li>
                  ))}
        </ol>
      </div>
      </div>
    </div>
  );
}
