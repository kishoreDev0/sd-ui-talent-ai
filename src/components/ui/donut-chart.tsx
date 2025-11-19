import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  value: number;
  color: string;
  size?: number;
  className?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  value,
  color,
  size = 80,
  className = '',
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  const data = [
    { name: 'match', value: clampedValue },
    { name: 'remaining', value: 100 - clampedValue },
  ];

  const COLORS = [color, '#e5e7eb'];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.5}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center pointer-events-none"
        style={{
          width: size,
          height: size,
        }}
      >
        <span className="text-sm font-bold" style={{ color }}>
          {clampedValue.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default DonutChart;
