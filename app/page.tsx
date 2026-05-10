'use client'
import { getAllData } from "./actions/load-csv";
import type { EbirdDataRow } from "./models/data";
import {useEffect, useState, Suspense} from 'react';
export default function Home() {
  const [data, setData]: [EbirdDataRow[], (data: EbirdDataRow[]) => void] = useState<EbirdDataRow[]>([])
  useEffect(() => {
    getAllData().then(result => setData(result as EbirdDataRow[]))
  }, [])

  return (
    <div>
      <h1>ebird dashboard</h1>
      <p>{data.length} records</p>
    </div>
  );
}
