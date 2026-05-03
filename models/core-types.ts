export type SubmissionId = string;
export type County = string;
export type LocationId = string;
export type LocationName = string;
export type Latitude = number;
export type Longitude = number;
export type TaxonomicOrder = number;

export type Species = {
  commonName: string;
  scientificName: string;
  taxonomicOrder: TaxonomicOrder;
  records: BirdRecord[];
};

export type Location = {
  stateProvince: string;
  county: County;
  locationId: LocationId;
  location: LocationName;
  latitude: Latitude;
  longitude: Longitude;
  submissions: Submission[];
}

export type Submission = {
  submissionId: SubmissionId;
  date: Date;
  location: Location;
  records: BirdRecord[];
};

export type BirdRecord = {
  species: Species;
  count: number;
  submission: Submission;
};

export type EbirdDataRow = Submission & Species & Location & Omit<BirdRecord, 'submission' | 'species'>;
