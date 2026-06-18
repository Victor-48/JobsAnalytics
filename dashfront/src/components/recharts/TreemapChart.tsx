import React from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';

const TreemapChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="size"
        ratio={4 / 3}
        stroke="#fff"
        fill="#8884d8"
      />
    </ResponsiveContainer>
  );
};

export default TreemapChart;