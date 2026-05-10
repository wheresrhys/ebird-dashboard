export type SubmissionId = string;
export type County = string;
export type LocationId = string;
export type LocationName = string;
export type Latitude = number;
export type Longitude = number;
export type TaxonomicOrder = number;
export type ScientificName = string;

export type Species = {
  commonName: string;
  scientificName: ScientificName;
  taxonomicOrder: TaxonomicOrder;
  records: BirdRecord[];
  isSubspecies: boolean;
};

export type Location = {
  stateProvince: string;
  county: County;
  locationId: LocationId;
  location: LocationName;
  latitude: Latitude;
  longitude: Longitude;
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
  rawData: EbirdDataRow
};

export type EbirdDataRow = Submission & Species & Location & Omit<BirdRecord, 'submission' | 'species'>;
