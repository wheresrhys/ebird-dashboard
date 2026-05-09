import type { DB } from '../models/create-db';
import type { Species, Location } from '../models/core-types';

export type Tick = {
  species: Species;
  date: Date;
  submissionId: string;
  location: Location
}

const sortValueGetters: Record<string, (tick: Tick) => number> = {
  taxonomicOrder: (tick: Tick) => tick.species.taxonomicOrder as number,
  date: (tick: Tick)=>tick.date.getTime()
}

export function getTicks(db: DB, sortBy: 'taxonomicOrder' | 'date'): Tick[] {
  const sortValueGetter = sortValueGetters[sortBy];
  return db.species.map(species => ({
    species,
    date: species.records[0].submission.date,
    submissionId: species.records[0].submission.submissionId,
    location: species.records[0].submission.location
  })).sort((a, b) => sortValueGetter(a) - sortValueGetter(b));
}


