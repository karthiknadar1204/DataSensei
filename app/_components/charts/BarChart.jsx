'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const BarChart = ({ data }) => {
  if (!data || !data.length) return null;

  console.log("Original data:", data);

  // Dynamic data formatting
  const formattedData = data.map(d => {
    // If data already has label/value format
    if (d.label !== undefined && d.value !== undefined) {
      return {
        label: d.label,
        value: Number(d.value) || 0
      };
    }
    
    // If data has different keys, use first key as label and second as value
    const keys = Object.keys(d);
    if (keys.length >= 2) {
      return {
        label: d[keys[0]],
        value: Number(d[keys[1]]) || 0
      };
    }
    
    return null;
  }).filter(Boolean);

  console.log("Formatted data:", formattedData);

  if (!formattedData.length) return null;

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={formattedData}
          margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white p-2 border rounded shadow-sm">
                  <p className="font-medium">{label}</p>
                  <p>{`Value: ${payload[0].value}`}</p>
                </div>
              );
            }}
          />
          <Bar
            dataKey="value"
            fill="var(--chart-1, #ef4444)"
            radius={[4, 4, 0, 0]}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart; 
