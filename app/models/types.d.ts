export type SubmissionId = string;
export type County = string;
export type LocationId = string;
export type LocationName = string;
export type Latitude = number;
export type Longitude = number;
export type TaxonomicOrder = number;
export type ScientificName = string;

export type EbirdDataRow = {
  commonName: string;
  scientificName: ScientificName;
  taxonomicOrder: TaxonomicOrder;
  records: EbirdDataRow[];
  stateProvince: string;
  county: County;
  locationId: LocationId;
  location: LocationName;
  latitude: Latitude;
  longitude: Longitude;
  submissionId: SubmissionId;
  date: Date;
  count: number;
}

export type Species = {
  commonName: string;
  scientificName: ScientificName;
  taxonomicOrder: TaxonomicOrder;
  records: EbirdDataRow[];
  isSubspecies: boolean;
};
