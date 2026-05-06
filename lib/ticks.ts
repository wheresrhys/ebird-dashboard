import type { DB } from '../models/create-db';
import type { Species, Location } from '../models/core-types';

type Tick = {
  species: Species;
  date: Date;
  submissionId: string;
  location: Location
}

export function getTicks(db: DB): Tick[] {
  return db.species.map(species => ({
    species,
    date: species.records[0].submission.date,
    submissionId: species.records[0].submission.submissionId,
    location: species.records[0].submission.location
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}


