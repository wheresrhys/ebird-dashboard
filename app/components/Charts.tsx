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
import { buildTickTally, type TickWrapper } from "../lib/ticks";

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
    return <RarityBucketsChart key={year} rarityBuckets={ticks.getRarityBuckets(year)} year={year} index={i}/>

  })}</div>
}
/** 0 → red, 1 → blue (HSL hue 0° → 180°). */
function rarityBucketColor(t: number): string {
  // avoids too much bunching around green/cyan, where visual contrast is not strong.
  if (t > 0.65 && t < 0.9) {
    t = t + (0.9 - t)/2
  }
  const h = 210 * t;//Math.max(0, Math.min(1, t));
  const l = 45 + (t * 20) //46
  const s = 75 - (t * 5) //72
  return `hsl(${h} ${s}% ${l}%)`;
}

function RarityBucketsChart({
  rarityBuckets,
  year,
  index
}: {
  rarityBuckets: Record<string, number>;
  year: number;
  index: number;
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
  const backgroundColor = entries.map((_, i) =>
    rarityBucketColor(n <= 1 ? 0 : i / (n - 1)),
  );
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
          text: year,
        },
    },
  };
  return (
    <div className="h-40 w-40 shrink-0">
      <Doughnut data={data} options={options} />
    </div>
  );
}
