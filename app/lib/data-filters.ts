import type { EbirdDataRow } from "../models/types";

export function getYearFilter(year: number): EbirdDataFilter {
  return (row: EbirdDataRow) => row.date.year === year;
}

export type EbirdDataFilter = (row: EbirdDataRow) => boolean;

export function filterData(data: EbirdDataRow[], filters: EbirdDataFilter[]): EbirdDataRow[] {
  return data.filter(row => filters.every(filter => filter(row)));
}
