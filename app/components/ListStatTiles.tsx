import { useEffect, useState } from 'react';
import { DataWrapper } from '../lib/data-wrapper';
import { listConfigs } from '../models/lists';

function ListStatTile({ data, id }: { id: string, data: DataWrapper }) {
  const filteredData = data.getDataForList(id);
  const ticksWrapper = filteredData.getTicks('firstSeen');
  const { recordYear, recordYearTicks } = ticksWrapper.recordTicksAndYear;
  const thisYearTicks = ticksWrapper.getTicksForYear(new Date().getFullYear());

  const [averageYearlyTally, setAverageYearlyTally] = useState<number | null>(null);
  const [averageBasedPrediction, setAverageBasedPrediction] = useState<number | null>(null)
  const [detailBasedPrediction, setDetailBasedPrediction] = useState<number | null>(null)

  useEffect(() => {
    setAverageYearlyTally(Math.round(ticksWrapper.averageTickTally[364]));
    setAverageBasedPrediction(ticksWrapper.getPredictionBasedOnAverage());
    setDetailBasedPrediction(ticksWrapper.getPredictionBasedOnDetail());
  }, [ticksWrapper])

  return (
    <>
      <div className="stat-value">{ticksWrapper.ticks.length}</div>
      <div className="stat-title">{recordYearTicks} in {recordYear} {averageYearlyTally ? <span className="text-gray-400">({averageYearlyTally})</span> : null}</div>
      <div className="stat-title">{thisYearTicks.ticks.length} {(averageBasedPrediction && detailBasedPrediction) ? <span className="text-gray-400">({averageBasedPrediction} | {detailBasedPrediction})</span> : null}</div>
      <div className="stat-title">{ticksWrapper.ticks[ticksWrapper.ticks.length - 1].commonName}</div>
    </>
  )
}


function ListStatTileWrapper({ name, id, data, onSelect, isSelected }: { name: string, id: string, data: DataWrapper, onSelect: (id: string) => void, isSelected: boolean }) {
  return (
    <div className={`stat ${isSelected ? 'bg-gray-100' : ''} cursor-pointer flex-1 min-w-0`} onClick={() => onSelect(id)}>
      <div className="stat-desc">{name}</div>
      {data.hasData() ? <ListStatTile data={data} id={id} /> : null}
    </div>
  )
}


export function ListStatTiles({ allTimeData, activeList, onSelectList }: { allTimeData: DataWrapper, activeList: string, onSelectList: (id: string) => void }) {
  return <div className="w-full ">
    <div className="join stats stats-border shadow-none flex">
      <div className="stat w-50">
        <div className="stat-desc">Region</div>
        <div className="stat-value">All time</div>
        <div className="stat-title">Year record <span className="text-gray-400">(avg)</span></div>
        <div className="stat-title">This year <span className="text-gray-400">(predicted)</span></div>
        <div className="stat-title">Last tick</div>
      </div>
      {listConfigs.map(config => <ListStatTileWrapper key={config.id} {...config} data={allTimeData} onSelect={onSelectList} isSelected={config.id === activeList} />)}
    </div>
  </div>
}
