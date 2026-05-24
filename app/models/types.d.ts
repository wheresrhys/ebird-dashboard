import { Temporal } from 'temporal-polyfill';

export type SubmissionId = string;
export type County = string;
export type LocationId = string;
export type LocationName = string;
export type Latitude = number;
export type Longitude = number;
export type TaxonomicOrder = number;
export type ScientificName = string;

export type EbirdDataSharedRow = {
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
  count: number;
}

export type EbirdDataServerRow = EbirdDataSharedRow & {
  date: string;
}
export type EbirdDataRow = EbirdDataSharedRow & {
  date: Temporal.PlainDate;
}


export type Species = {
  commonName: string;
  scientificName: ScientificName;
  taxonomicOrder: TaxonomicOrder;
  records: EbirdDataRow[];
  isSubspecies: boolean;
};
