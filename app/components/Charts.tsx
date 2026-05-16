"use client";

import {
  Chart as ChartJS,
  BarElement,
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
import { Bar, Line } from "react-chartjs-2";
import { buildTickTally, type TickWrapper, RARITY_CLASSIFICATIONS } from "../lib/ticks";
type RarityLabel = (typeof RARITY_CLASSIFICATIONS)[number];

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DAY_LABELS = [...Array(365)].map((_, i) => String(i + 1));

const RARITY_BUCKET_COLORS: Record<RarityLabel, string> = {
  "Heart attack": "hsl(0 92% 52%)",
  Blimey: "hsl(20 92% 54%)",
  "Pretty Special": "hsl(38 94% 52%)",
  "Very nice": "hsl(48 96% 56%)",
  Nice: "hsl(136 62% 42%)",
  Humdrum: "hsl(217 88% 52%)",
};

const DEFICIT_COLOR = "hsl(220 12% 92%)";

function rarityBucketColor(label: string): string {
  if (label in RARITY_BUCKET_COLORS) {
    return RARITY_BUCKET_COLORS[label as RarityLabel];
  }
  return "hsl(220 10% 65%)";
}

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
        label: "Average",
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
            const day =
              typeof tickValue === "string"
                ? Number(tickValue)
                : Number(tickValue);
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
  const { recordYearTicks } = ticks.recordTicksAndYear;
  const years = [...ticks.comparableYears, new Date().getFullYear()].sort(
    (a, b) => a - b,
  );

  if (years.length === 0 || recordYearTicks === 0) {
    return null;
  }

  const rarityLabels = Object.keys(ticks.getRarityBuckets(years[0]));

  rarityLabels.reverse();

  const data: ChartData<"bar", number[], string> = {
    labels: years.map(String),
    datasets: [
      ...rarityLabels.map((label) => ({
        label,
        data: years.map((year) => ticks.getRarityBuckets(year)[label] ?? 0),
        backgroundColor: rarityBucketColor(label),
        borderWidth: 0,
      })),
      {
        label: "Below record",
        data: years.map(
          (year) => recordYearTicks - ticks.getTicksForYear(year).ticks.length,
        ),
        backgroundColor: DEFICIT_COLOR,
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
      title: {
        display: true,
        text: "Ticks by rarity (stacked to year record)",
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        stacked: true,
        max: recordYearTicks,
        beginAtZero: true,
        title: { display: true, text: "Ticks" },
      },
      y: { stacked: true },
    },
  };

  const chartHeight = Math.max(160, years.length * 36 + 48);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <Bar data={data} options={options} />
    </div>
  );
}
