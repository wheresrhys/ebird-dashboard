import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { getRarityLabels, RARITY_CLASSIFICATIONS, type TickWrapper, TickWithRarity } from '../lib/ticks';
import { PAST_YEARS } from '../lib/data-filters';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function TickYearScatterChart({ ticks }: { ticks: TickWrapper }) {
  const thisYear = new Date().getFullYear();
  const rarityLabels = getRarityLabels(PAST_YEARS.length)
  rarityLabels.reverse();
  const allTicksByYear: [string, TickWrapper][] = [
    ...Object.entries(ticks.ticksFromComparableYears),
    [String(thisYear), ticks.getTicksForYear(thisYear)]
  ];

  const allTicks: { tick: TickWithRarity, year: number }[] = allTicksByYear
    .flatMap(([year,ticks]) =>
      ticks.ticksWithRarity.map(tick => ({
        tick, year: Number(year)
      }))
    )

  const data = {
    datasets:
      rarityLabels.map((label, i) => ({
        label: label,
        data: allTicks.filter(({tick})  => tick.rarityClassification === label)
          .map(({year, tick}) => ({
            x: tick.salientRecord.date.dayOfYear,
            y: year,
            label: tick.commonName
          })),
        backgroundColor: RARITY_CLASSIFICATIONS[label].chartColour,
        pointRadius: (i+2)
      }))

  }

  const options: ChartOptions<"scatter"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text: "Tick dates",
      },
      tooltip: {
        // mode: "index",
        intersect: false,
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        min: 1,
        max: 365,
        ticks: {
          stepSize: 7,
          precision: 0,
          callback: (value: unknown) => Math.floor(Number(value) / 7)
        },
        grace: 0,

        title: { display: true, text: "Days" },
      },
      y: {
        reverse: true,
        title: { display: true, text: "Years" },
        ticks: {
          stepSize: 1,        // tick every 1 unit
          precision: 0,       // no decimal places in labels
          // optional: hide any stray non-integer tick Chart.js might still build
          callback: (value: string | number) =>
            Number.isInteger(value) ? value : undefined,
        },
        grace: 0,             // v4: reduces extra padding that can add odd ticks
      },
    },
  };

  return (
    <div className="w-full" style={{ height: 400 }}>
      <Scatter options={options} data={data} />;
    </div>
  );
}

