import type { EbirdDataRow } from "../models/data";

export function getYearFilter(year: number): EbirdDataFilter {
  return (row: EbirdDataRow) => row.date.getFullYear() === year;
}

export type EbirdDataFilter = (row: EbirdDataRow) => boolean;

export function filterData(data: EbirdDataRow[], filters: EbirdDataFilter[]): EbirdDataRow[] {
  return data.filter(row => filters.every(filter => filter(row)));
}
