import { useRef, useEffect } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import { useSolarStore } from "../../stores/solarStore";

export function KpChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const kpHistory = useSolarStore((s) => s.kpHistory);

  useEffect(() => {
    if (!containerRef.current || kpHistory.length < 2) return;

    const times = new Float64Array(kpHistory.map((h) => h.time / 1000));
    const values = new Float64Array(kpHistory.map((h) => h.value));

    const data: uPlot.AlignedData = [times, values];

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
          stroke: "#22c55e",
          fill: "#22c55e33",
          width: 1.5,
        },
      ],
      scales: {
        y: { min: 0, max: 9 },
      },
    };

    chartRef.current = new uPlot(opts, data, containerRef.current);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [kpHistory]);

  if (kpHistory.length < 2) {
    return (
      <div>
        <div className="text-[10px] text-gray-500 uppercase mb-1">Kp Index Trend</div>
        <div className="text-xs text-gray-600">Collecting data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[10px] text-gray-500 uppercase mb-1">Kp Index Trend</div>
      <div ref={containerRef} />
    </div>
  );
}
