import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, ZAxis } from 'recharts';

const BubbleChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <XAxis type="category" dataKey="x" name="Category" />
        <YAxis type="number" dataKey="y" name="Value" />
        <ZAxis type="number" dataKey="z" range={[60, 400]} name="Size" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Tech Skills" data={data} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default BubbleChart;