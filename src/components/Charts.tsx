"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function ScoreLine({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const accent = cssVar("--accent", "#1fb6d6");
  const grid = cssVar("--line", "#262b38");
  const muted = cssVar("--muted", "#a4adbd");

  return (
    <div className="h-48">
      <Line
        data={{
          labels,
          datasets: [
            {
              data: values,
              borderColor: accent,
              backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
              fill: true,
              tension: 0.35,
              pointRadius: 3,
              pointBackgroundColor: accent,
              borderWidth: 2.5,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => `${(c.parsed.y ?? 0).toFixed(1)}%` },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 100,
              grid: { color: grid },
              ticks: { color: muted, callback: (v) => `${v}%`, stepSize: 25 },
            },
            x: {
              grid: { display: false },
              ticks: { color: muted, maxRotation: 0, autoSkipPadding: 12 },
            },
          },
        }}
      />
    </div>
  );
}
