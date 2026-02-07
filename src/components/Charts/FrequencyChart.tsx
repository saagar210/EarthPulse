import { useRef, useEffect } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEarthquakeStore } from "../../stores/earthquakeStore";

export function FrequencyChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);

  useEffect(() => {
    if (!containerRef.current) return;

    const now = Date.now();
    const hoursAgo24 = now - 24 * 3600000;
    const hourBins = new Array(24).fill(0);

    for (const eq of earthquakes) {
      if (eq.time >= hoursAgo24) {
        const hoursBack = Math.floor((now - eq.time) / 3600000);
        const idx = 23 - Math.min(hoursBack, 23);
        hourBins[idx]++;
      }
    }

    const times = hourBins.map((_, i) => {
      return (now - (23 - i) * 3600000) / 1000;
    });

    const data: uPlot.AlignedData = [
      new Float64Array(times),
      new Float64Array(hourBins),
    ];

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const opts: uPlot.Options = {
      width: containerRef.current.clientWidth,
      height: 120,
      padding: [8, 8, 0, 0],
      cursor: { show: false },
      legend: { show: false },
      axes: [
        {
          stroke: "#6b7280",
          grid: { show: false },
          ticks: { show: false },
          values: (_, splits) =>
            splits.map((v) => {
              const d = new Date(v * 1000);
              return `${d.getHours()}h`;
            }),
          font: "10px sans-serif",
        },
        {
          stroke: "#6b7280",
          grid: { stroke: "#374151", width: 1 },
          ticks: { show: false },
          font: "10px sans-serif",
          size: 30,
        },
      ],
      series: [
        {},
        {
          stroke: "#f97316",
          fill: "#f9731633",
          width: 1.5,
        },
      ],
    };

    chartRef.current = new uPlot(opts, data, containerRef.current);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [earthquakes]);

  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">24h Frequency</div>
      <div ref={containerRef} />
    </div>
  );
}
