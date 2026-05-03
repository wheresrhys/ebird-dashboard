import { getTicksList } from '../lib/ticks-list';
import { createDb } from '../models/create-db';
import { getYear } from '../models/load-csv';


export default function Home() {
  const db = createDb(getYear(2023));
  const ticksList = getTicksList(db);
  return (
    <ol className="list-decimal list-inside">
      {ticksList.map(tick => (
        <li key={tick.submissionId}>
          {tick.species.commonName} - {tick.date.toLocaleDateString()} - {tick.location.location}
        </li>
      ))}
    </ol>
  );
}
