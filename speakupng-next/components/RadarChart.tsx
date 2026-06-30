'use client';

import React from 'react';

interface RadarData {
  label: string;
  value: number;
}

interface RadarChartProps {
  data: RadarData[];
  maxValue?: number;
  size?: number;
}

export function RadarChart({ data, maxValue = 5, size = 300 }: RadarChartProps) {
  const center = size / 2;
  const radius = (size / 2) * 0.7; // Leave 30% margin for labels
  const totalPoints = data.length;

  if (totalPoints < 3) return null;

  // Calculate points for the chart data
  const points = data.map((d, i) => {
    const angle = (i * 2 * Math.PI) / totalPoints - Math.PI / 2; // Start from top
    const valueRatio = d.value / maxValue;
    const x = center + radius * Math.cos(angle) * valueRatio;
    const y = center + radius * Math.sin(angle) * valueRatio;
    return { x, y, angle, label: d.label, value: d.value };
  });

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Calculate grid levels (e.g., 25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grid Polygons */}
        {gridLevels.map((level, levelIdx) => {
          const gridPoints = points.map((p, i) => {
            const angle = (i * 2 * Math.PI) / totalPoints - Math.PI / 2;
            const x = center + radius * Math.cos(angle) * level;
            const y = center + radius * Math.sin(angle) * level;
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={levelIdx}
              points={gridPoints}
              fill="none"
              stroke="#2c312a"
              strokeWidth={1}
              strokeDasharray={levelIdx < 3 ? '4,4' : 'none'}
            />
          );
        })}

        {/* Axis Lines */}
        {points.map((p, i) => {
          const angle = (i * 2 * Math.PI) / totalPoints - Math.PI / 2;
          const outerX = center + radius * Math.cos(angle);
          const outerY = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outerX}
              y2={outerY}
              stroke="#2c312a"
              strokeWidth={1}
            />
          );
        })}

        {/* Data Area */}
        {pointsString && (
          <>
            <polygon
              points={pointsString}
              fill="rgba(0, 179, 104, 0.2)"
              stroke="#00b368"
              strokeWidth={2}
              className="transition-all duration-500 ease-in-out"
            />
            {/* Data Points (Dots) */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill="#e8a020"
                stroke="#1d211b"
                strokeWidth={1.5}
              />
            ))}
          </>
        )}

        {/* Labels */}
        {points.map((p, i) => {
          // Push label slightly outward from the outer vertex
          const labelOffset = 15;
          const labelX = center + (radius + labelOffset) * Math.cos(p.angle);
          const labelY = center + (radius + labelOffset) * Math.sin(p.angle);

          // Text alignment based on position
          let textAnchor: 'middle' | 'start' | 'end' = 'middle';
          if (Math.cos(p.angle) > 0.1) textAnchor = 'start';
          if (Math.cos(p.angle) < -0.1) textAnchor = 'end';

          let dy = '0.35em';
          if (Math.sin(p.angle) > 0.5) dy = '0.8em';
          if (Math.sin(p.angle) < -0.5) dy = '-0.2em';

          return (
            <text
              key={i}
              x={labelX}
              y={labelY}
              textAnchor={textAnchor}
              dy={dy}
              fill="#6b7163"
              className="text-[10px] font-bold uppercase tracking-wider select-none font-display"
            >
              {p.label} ({p.value > 0 ? p.value.toFixed(1) : '—'})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
