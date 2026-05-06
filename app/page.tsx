import { getTicks } from '../lib/ticks';
import { createDb } from '../models/create-db';
import { listAvailableYears } from '../models/load-csv';
import { filterData, getYearFilter } from '../lib/data-filters';

function getTicksWithFilters(filters: EBirdDataFilter[]): Tick[] {
  const records = filterData(filters);
  const db = createDb(records);
  return getTicks(db);
}

function getTicksByYear(): Record<number, Tick[]> {
  const listOfYears = listAvailableYears();
  return Object.fromEntries(listOfYears.map(year => [year,getTicksWithFilters([getYearFilter(year)])]));
}

export default function Home() {
  const thisYear = new Date().getFullYear();

  const allTimeTicks = getTicksWithFilters([]);
  const ticksByYear = getTicksByYear();
  const thisYearTicks = ticksByYear[thisYear];
  const recordYearTicks = Math.max(...Object.values(ticksByYear).map(ticks => ticks.length));

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
            <div className="stat-value">{allTimeTicks.length}</div>
            <div className="stat-title">{recordYearTicks}</div>
            <div className="stat-title">{thisYearTicks.length}{' '}<span className="text-gray-400">(200)</span></div>
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
