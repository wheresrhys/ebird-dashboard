'use server';
import fs from 'fs';
import path from 'path';
import neatCsv from 'neat-csv';
import { camelCase } from 'change-case';
import { sanitiseData } from '@/app/lib/sanitise-data';
import type { EbirdDataRow } from '../models/types';

async function loadCsv () {
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
  return sanitiseData(rawData)
}

let sanitisedData: EbirdDataRow[];

export async function getAllData(): Promise<EbirdDataRow[]> {
  if (!sanitisedData) {
    sanitisedData = await loadCsv()
  }
  return sanitisedData;
}
