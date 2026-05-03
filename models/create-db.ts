
import type { Submission, BirdRecord, Species, EbirdDataRow, Location, LocationId, SubmissionId } from './core-types';

export type DB = {
  submissions: Submission[];
  species: Species[];
  locations: Location[];
}

export function createDb(rawData: EbirdDataRow[]): DB {
  const speciesMap: Record<string, Species> = {};
  const locationMap: Record<LocationId, Location> = {};

  function getSpecies(ebirdDataRow: EbirdDataRow): Species {
    const existingSpecies = speciesMap[ebirdDataRow.scientificName]
    if (existingSpecies) {
      return existingSpecies;
    }
    speciesMap[ebirdDataRow.scientificName] = {
      scientificName: ebirdDataRow.scientificName,
      commonName: ebirdDataRow.commonName,
      taxonomicOrder: ebirdDataRow.taxonomicOrder,
      records: []
    }
    return speciesMap[ebirdDataRow.scientificName]
  }

  function getLocation(ebirdDataRow: EbirdDataRow): Location {
    const existingLocation = locationMap[ebirdDataRow.locationId]
    if (existingLocation) {
      return existingLocation;
    }
    locationMap[ebirdDataRow.locationId] = {
      stateProvince: ebirdDataRow.stateProvince,
        county: ebirdDataRow.county,
          locationId: ebirdDataRow.locationId,
            location: ebirdDataRow.location,
              latitude: ebirdDataRow.latitude,
                longitude: ebirdDataRow.longitude,
      submissions: [] as Submission[]
    }
    return locationMap[ebirdDataRow.locationId]
  }

  const submissionsMap: Record<SubmissionId, Submission>  = rawData.reduce((submissionsMap, ebirdDataRow) => {
    let submission = submissionsMap[ebirdDataRow.submissionId]
    if (!submission) {
      submission = {
        submissionId: ebirdDataRow.submissionId,
        location: getLocation(ebirdDataRow),
        date: ebirdDataRow.date,
        records: [] as BirdRecord[]
      };
      submissionsMap[ebirdDataRow.submissionId] = submission;
      submission.location.submissions.push(submission);
    }

    const species = getSpecies(ebirdDataRow);
    const record = {
      species,
      count: ebirdDataRow.count,
      submission: submissionsMap[ebirdDataRow.submissionId]
    }
    submissionsMap[ebirdDataRow.submissionId].records.push(record);
    species.records.push(record)

    return submissionsMap;
  }, {} as Record<string, Submission>);

  return {
    submissions: Object.values(submissionsMap),
    species: Object.values(speciesMap).map(species => {
      species.records = species.records.sort((a, b) => a.submission.date.getTime() - b.submission.date.getTime());
      return species
    }),
    locations: Object.values(locationMap)
  }
}
