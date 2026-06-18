import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, Cell } from 'recharts';

// Assuming data is in the format: { x: string, y: string, value: number }[]
const HeatmapChart = ({ data }) => {
  const colors = ["#blue", "#cyan", "#green", "#yellow", "#red"];
  const getColor = (value) => {
    const max = Math.max(...data.map(d => d.value));
    const index = Math.floor((value / max) * (colors.length - 1));
    return colors[index];
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart>
        <XAxis type="category" dataKey="x" name="Day" />
        <YAxis type="category" dataKey="y" name="Hour" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Jobs" data={data} shape="square">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default HeatmapChart;