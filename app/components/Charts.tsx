"use client";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { buildTickTally, type TickWrapper, RARITY_CLASSIFICATIONS } from "../lib/ticks";
type RarityLabel = (typeof RARITY_CLASSIFICATIONS)[number];

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DAY_LABELS = [...Array(365)].map((_, i) => String(i + 1));

export function YearsRaceChart({ ticks }: { ticks: TickWrapper }) {
  const thisYear = new Date().getFullYear();
  const thisYearTicks = buildTickTally(ticks.ticksByYear[thisYear], true);
  const otherYearTicks: [string, number[]][] =
    Object.entries(ticks.ticksFromComparableYears).map(([year, yTicks]) => [
      year,
      buildTickTally(yTicks),
    ]);


  const otherYearDatasets = otherYearTicks.map(([year, tally], i) => {
    return {
      label: String(year),
      data: tally,
      borderColor: `rgba(100, 116, 139, ${0.2 + i * 0.1})`,
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      tension: 0.12,
    };
  });

  const data: ChartData<"line", number[], string> = {
    labels: DAY_LABELS,
    datasets: [
      {
        label: `${thisYear} (this year)`,
        data: thisYearTicks,
        borderColor: "rgb(37 99 235)",
        backgroundColor: "transparent",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.12,
      },
      {
        label: 'Average',
        data: ticks.averageTickTally,
        borderColor: "rgb(120 180 235)",
        backgroundColor: "transparent",
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.12,
      },
      ...otherYearDatasets,


    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Cumulative ticks by day of year",
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Week of year" },
        ticks: {
          maxTicksLimit: 52,
          callback(this, tickValue) {
            const day = typeof tickValue === "string" ? Number(tickValue) : Number(tickValue);
            if (!Number.isFinite(day)) return "";
            return String(Math.floor(day / 7) + 1);
          },
        },

      },
      y: {
        title: { display: true, text: "Ticks" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-80 w-full min-h-[240px]">
      <Line data={data} options={options} />
    </div>
  );
}
export function YearlyRarityComparisonCharts({ ticks }: { ticks: TickWrapper }) {
  return <div className="flex ">{[...ticks.comparableYears, new Date().getFullYear()].map((year, i) => {
    return <RarityBucketsChart key={year} rarityBuckets={ticks.getRarityBuckets(year)} year={year}/>

  })}</div>
}

const RARITY_BUCKET_COLORS: Record<RarityLabel, string> = {
  "Heart attack": "hsl(0 92% 52%)", // bright red
  Blimey: "hsl(20 92% 54%)", // reddish orange
  "Pretty Special": "hsl(38 94% 52%)", // amber
  "Very nice": "hsl(48 96% 56%)", // yellow
  Nice: "hsl(136 62% 42%)", // green
  Humdrum: "hsl(217 88% 52%)", // blue
};
function rarityBucketColor(label: string): string {
  if (label in RARITY_BUCKET_COLORS) {
    return RARITY_BUCKET_COLORS[label as RarityLabel];
  }
  return "hsl(220 10% 65%)";
}

function RarityBucketsChart({
  rarityBuckets,
  year,
}: {
  rarityBuckets: Record<string, number>;
  year: number;
}) {
  const entries = Object.entries(rarityBuckets);
  const counts = entries.map(([, c]) => c);
  const total = counts.reduce((a, b) => a + b, 0);
  const n = entries.length;
  if (total === 0 || n === 0) {
    return (
      <div
        className="flex h-40 w-40 shrink-0 items-center justify-center rounded-full border border-dashed border-base-300 text-xs text-base-content/50"
        aria-label={`Rarity ${year}: no ticks`}
      />
    );
  }
  const backgroundColor = entries.map(([label]) => rarityBucketColor(label));
  const data: ChartData<"doughnut", number[], string> = {
    labels: entries.map(([label]) => label),
    datasets: [
      {
        data: counts,
        backgroundColor,
        borderWidth: 0,
      },
    ],
  };
  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "55%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: { enabled: false },
        title: {
          display: true,
          text: String(year),
        },
    },
  };
  return (
    <div className="h-40 w-40 shrink-0">
      <Doughnut data={data} options={options} />
    </div>
  );
}
