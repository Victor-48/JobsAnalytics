import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { formatValue, calculateTotal } from "../../utils/chartUtils";

interface Props {
    data: any[];
    displayType: 'bar' | 'pie';
    unit: 'percentage' | 'absolute';
}

const getThemeColor = (index: number) => `hsl(var(--chart-${(index % 5) + 1}))`;

export const EmploymentTypeChart = ({ data, displayType = 'pie', unit = 'percentage' }: Props) => {
    const total = calculateTotal(data, 'count');

    if (!data || data.length === 0) return null;

    return displayType === 'pie' ? (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    fill="hsl(var(--chart-1))"
                    dataKey="count"
                    stroke="hsl(var(--background))"
                    paddingAngle={2}
                >
                    {data.map((_, index) => <Cell key={`cell-${index}`} fill={getThemeColor(index)} />)}
                </Pie>
                <Tooltip
                    formatter={(value: any) => [formatValue(value, total, unit), 'Jobs']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
        </ResponsiveContainer>
    ) : (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" tickFormatter={(v) => formatValue(v, total, unit).toString()} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                <Tooltip
                    formatter={(value: any) => [formatValue(value, total, unit), 'Jobs']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
        </ResponsiveContainer>
    );
};