"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getRarityLabels, RARITY_CLASSIFICATIONS, type TickWrapper, RarityLabel  } from "../lib/ticks";


ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
);

export default function RarityBucketsChart({ ticks }: { ticks: TickWrapper }) {
  const thisYear = new Date().getFullYear();
  const rarityLabels = getRarityLabels(ticks.comparableYears.length)
  const barLabels = ['All time', ...Object.keys(ticks.ticksFromComparableYears), thisYear].map(String);

  rarityLabels.reverse();

  const data: ChartData<"bar", number[], string> = {
    labels: barLabels,
    datasets: [
      ...rarityLabels.map((label) => ({
        label,
        data: [ticks, ...Object.values(ticks.ticksFromComparableYears), ticks.getTicksForYear(thisYear)]
          .map(ticks =>
            ticks.rarityBuckets[label] ?? 0
          ),
        backgroundColor: RARITY_CLASSIFICATIONS[label as RarityLabel].chartColour,
        borderWidth: 0,
      })),
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
        beginAtZero: true,
        title: { display: true, text: "Ticks" },
      },
      y: {
        stacked: true
      },
    },
  };

  const chartHeight = Math.max(160, barLabels.length * 36 + 48);

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <Bar data={data} options={options} />
    </div>
  );
}
