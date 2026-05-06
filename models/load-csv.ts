import fs from 'fs';
import path from 'path';
import neatCsv from 'neat-csv';
import { camelCase } from 'change-case';

import type { EbirdDataRow } from './core-types';

const csvFilePath = path.resolve('./data/MyEbirdData.csv');
const rawData: EbirdDataRow[] = await neatCsv(fs.createReadStream(csvFilePath), {
  mapHeaders: ({ header }) => {
    const camelCased = camelCase(header);
    return ['time',
    'protocol',
    'durationMin',
    'allObsReported',
    'distanceTraveledKm',
    'areaCoveredHa',
    'numberOfObservers', 'time'].includes(camelCased) ? null : camelCased;
  },
  mapValues: ({ header, index, value }) => {
    switch (header) {
      case 'taxonomicOrder':
      case 'count':
      case 'durationMin':
      case 'numberOfObservers':
      case 'allObsReported':
      case 'distanceTraveledKm':
      case 'areaCoveredHa':
      case 'latitude':
      case 'longitude':
        return parseFloat(value);
      case 'date':
        return new Date(value);
      default:
        return value as string;
    }
  }
});

export function getAllData(): EbirdDataRow[] {
  return rawData;
}

export function listAvailableYears(): number[] {
  return Array.from(new Set(rawData.map(row => row.date.getFullYear()))).sort();
}
