import type { EbirdDataRow } from "../models/types";

export function getYearFilter(year: number): EbirdDataFilter {
  return (row: EbirdDataRow) => row.date.year === year;
}

export type EbirdDataFilter = (row: EbirdDataRow) => boolean;

export function filterData(data: EbirdDataRow[], filters: EbirdDataFilter[]): EbirdDataRow[] {
  return data.filter(row => filters.every(filter => filter(row)));
}


const FIRST_PROPER_EBIRD_YEAR = 2021;

function listComparableYears(): number[] {
  const years = [];
  const thisYear = new Date().getFullYear();
  let year = FIRST_PROPER_EBIRD_YEAR
  while (year < thisYear) {
    years.push(year);
    year++;
  }
  return years;
}
export const PAST_YEARS = listComparableYears()
export const ALL_YEARS = [...listComparableYears(), new Date().getFullYear()]
