'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9FA8DA',
  '#FFB6C1',
  '#87CEEB',
  '#98FB98'
];

const PieChart = ({ data, width = 600, height = 400 }) => {
  if (!data || !data.length) return null;

  const formattedData = data.map(d => ({
    name: d.label || d[Object.keys(d)[0]],
    value: Number(d.value || d[Object.keys(d)[1]]) || 0
  }));

  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    const percentage = ((data.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-2 border rounded shadow-sm">
        <p className="font-medium">{data.name}</p>
        <p>{`Value: ${data.value}`}</p>
        <p>{`Percentage: ${percentage}%`}</p>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <RechartsPieChart>
          <Pie
            data={formattedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={140}
            paddingAngle={2}
            label={(entry) => `${entry.name} (${((entry.value / total) * 100).toFixed(1)}%)`}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical"
            align="right"
            verticalAlign="middle"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart; 