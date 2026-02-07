import { useRef, useEffect } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useEarthquakeStore } from "../../stores/earthquakeStore";

export function MagnitudeChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const earthquakes = useEarthquakeStore((s) => s.earthquakes);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build magnitude bins: 0-1, 1-2, ..., 7-8, 8+
    const bins = new Array(9).fill(0);
    for (const eq of earthquakes) {
      const idx = Math.min(Math.floor(eq.magnitude), 8);
      bins[idx]++;
    }

    const labels = bins.map((_, i) => i);
    const data: uPlot.AlignedData = [
      new Float64Array(labels),
      new Float64Array(bins),
    ];

    // Destroy old chart
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
          values: (_, splits) => splits.map((v) => (v === 8 ? "8+" : `M${v}`)),
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
          fill: "#ef444466",
          stroke: "#ef4444",
          width: 1,
          paths: uPlot.paths.bars!({ size: [0.7], align: 1 }),
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
      <div className="text-[10px] text-gray-500 uppercase mb-1">Magnitude Distribution</div>
      <div ref={containerRef} />
    </div>
  );
}
