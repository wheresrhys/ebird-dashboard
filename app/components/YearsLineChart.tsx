"use client";

import {
  Chart as ChartJS,
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
import { Line } from "react-chartjs-2";
import { buildTickTally, type TickWrapper  } from "../lib/ticks";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const DAY_LABELS = [...Array(365)].map((_, i) => String(i + 1));

export default function YearsLineChart({ ticks }: { ticks: TickWrapper }) {
  const thisYear = new Date().getFullYear();
  const thisYearTicks = buildTickTally(ticks.getTicksForYear(thisYear), true);
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
