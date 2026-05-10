import { getAllData } from "../models/load-csv";
import type { EbirdDataRow } from "../../models/data";

export function getYearFilter(year: number): EBirdDataFilter {
  return row => row.date.getFullYear() === year;
}

export type EBirdDataFilter = (row: EbirdDataRow) => boolean;

export function filterData(filters: EBirdDataFilter[], rawData: EbirdDataRow[] = getAllData()): EbirdDataRow[] {
  return rawData.filter(row => filters.every(filter => filter(row)));
}
