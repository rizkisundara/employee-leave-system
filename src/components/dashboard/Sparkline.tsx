interface SparklineProps {
  data: number[];
  colorClass?: string;
  fillColorClass?: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  colorClass = "stroke-indigo-500",
  fillColorClass = "fill-indigo-500/10",
  width = 120,
  height = 40,
}: SparklineProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Area fill */}
      <polyline points={fillPoints} className={fillColorClass} />
      {/* Sparkline line */}
      <polyline
        points={points}
        className={colorClass}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
