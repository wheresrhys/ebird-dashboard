
import type { Submission, BirdRecord, Species, EbirdDataRow, Location, LocationId, SubmissionId, TaxonomicOrder, ScientificName, Longitude, Latitude, LocationName, County } from '../../models/data';
import { tickableSubspecies } from '@/app/lib/sanitise-data';
export type DB = {
  submissions: Submission[];
  species: Species[];
  locations: Location[];
  records: BirdRecord[];
}

function getFilteredSortedRecords(records: BirdRecord[], filter: (record: BirdRecord) => boolean): BirdRecord[] {
  return records.filter(filter).sort((a, b) => a.submission.date.getTime() - b.submission.date.getTime())
}

interface SpeciesInitialiser {
  scientificName: ScientificName;
  commonName: string;
  taxonomicOrder: TaxonomicOrder;
  isSubspecies?: boolean;
}


interface LocationInitialiser {
  stateProvince: string;
  county: County;
  locationId: LocationId;
  location: LocationName;
  latitude: Latitude;
  longitude: Longitude;
}

interface SubmissionInitialiser {
  submissionId: SubmissionId;
  date: Date;
  locationId?: LocationId;
}

function createSpecies(initialiser: SpeciesInitialiser, records: BirdRecord[]): Species {
  return {
    scientificName: initialiser.scientificName,
    commonName: initialiser.commonName,
    taxonomicOrder: initialiser.taxonomicOrder,
    get records() {
      return getFilteredSortedRecords(records, record => record.species.scientificName === initialiser.scientificName)
    },
    isSubspecies: initialiser.isSubspecies ?? tickableSubspecies.includes(initialiser.scientificName)
  };
}


function createLocation(initialiser: LocationInitialiser): Location {
  return {
    stateProvince: initialiser.stateProvince,
    county: initialiser.county,
    locationId: initialiser.locationId,
    location: initialiser.location,
    latitude: initialiser.latitude,
    longitude: initialiser.longitude,
  };
}

function createSubmission(initialiser: SubmissionInitialiser, records: BirdRecord[], locationMap: Record<LocationId, Location>): Submission {
  return {
    submissionId: initialiser.submissionId,
    date: initialiser.date,
    get records() {
      return getFilteredSortedRecords(records, record => record.submission.submissionId === initialiser.submissionId)
    },
    get location() {
      return initialiser.locationId ? locationMap[initialiser.locationId] : (initialiser as Submission).location
    }
  };
}

export function createDb(rawData: EbirdDataRow[]): DB {
  const birdRecords: BirdRecord[] = [];
  const speciesMap: Record<string, Species> = {};
  const locationMap: Record<LocationId, Location> = {};
  const submissionsMap: Record<SubmissionId, Submission> = {};

  rawData.forEach( ebirdDataRow => {
    const birdRecord = {
      count: ebirdDataRow.count,
      get species() {
        return speciesMap[ebirdDataRow.scientificName]
      },
      get submission() {
        return submissionsMap[ebirdDataRow.submissionId]
      },
      rawData: ebirdDataRow
    }
    birdRecords.push(birdRecord);

    let submission = submissionsMap[ebirdDataRow.submissionId]
    if (!submission) {
      submission = createSubmission(ebirdDataRow, birdRecords, locationMap)
      submissionsMap[ebirdDataRow.submissionId] = submission;
    }

    let species = speciesMap[ebirdDataRow.scientificName]
    if (!species) {
      species = createSpecies(ebirdDataRow, birdRecords);
      speciesMap[ebirdDataRow.scientificName] = species;
    }

    let location = locationMap[ebirdDataRow.locationId]
    if (!location) {
      location = createLocation(ebirdDataRow);
      locationMap[ebirdDataRow.locationId] = location;
    }
  });

  return {
    submissions: Object.values(submissionsMap),
    species: Object.values(speciesMap),
    locations: Object.values(locationMap),
    records: birdRecords
  }
}

export type BirdRecordFilter = (row: BirdRecord) => boolean;

export function filterData(filters: BirdRecordFilter[], records: BirdRecord[]): BirdRecord[] {
  return records.filter(row => filters.every(filter => filter(row)));
}

export function calveDb(db: DB, filters: BirdRecordFilter[]): DB {
  // shit - this doesn't work either!!!
  // always referring t othe original structures!!!
  // Need a way to filter the records and auto propagate out to everywhere
  // Hmmm... a class and `this` are the answer
  const records = filterData(filters, db.records);
  const species = db.species
    .filter(species => records.some(record => record.species.scientificName === species.scientificName))
    .map(species => createSpecies(species, records));
  const locations = db.locations
    .filter(location => submissions.some(submission => submission.location.locationId === location.locationId))
    .map(location => createLocation(location));
  const submissions = db.submissions
    .filter(submission => records.some(record => record.submission.submissionId === submission.submissionId))
    .map(submission => createSubmission(submission, records, Object.fromEntries(db.locations.map(location => [location.locationId, location]))));

  return {
    submissions,
    species,
    locations,
    records
  }
}
