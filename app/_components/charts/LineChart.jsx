'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const LineChart = ({ data, width = 600, height = 400, margin = { top: 20, right: 30, bottom: 60, left: 60 } }) => {
  if (!data || !data.length) return null;

  // Sort data by value for better visualization
  const formattedData = [...data]
    .sort((a, b) => b.value - a.value)
    .map(d => ({
      name: d.label,
      value: Number(d.value) || 0
    }));

  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={formattedData}
          margin={margin}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            label={{ value: data.xAxis || "Categories", position: 'bottom', offset: 40 }}
          />
          <YAxis
            domain={[0, 'auto']}
            label={{ 
              value: data.yAxis || "Values",
              angle: -90,
              position: 'left',
              offset: 20
            }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white p-2 border rounded shadow-sm">
                  <p className="font-medium">{label}</p>
                  <p>{`${data.yAxis || 'Value'}: ${payload[0].value}`}</p>
                </div>
              );
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-1, #ef4444)"
            strokeWidth={2}
            dot={{
              fill: "var(--chart-1, #ef4444)",
              r: 5,
              strokeWidth: 0
            }}
            activeDot={{
              r: 7,
              strokeWidth: 0
            }}
            connectNulls
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 