import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { formatValue, calculateTotal } from "../../utils/chartUtils";

interface Props {
    data: any[];
    displayType: 'bar' | 'pie';
    unit: 'percentage' | 'absolute';
}

const getThemeColor = (index: number) => `hsl(var(--chart-${(index % 5) + 1}))`;

export const JobsByExperienceChart = ({ data, displayType = 'bar', unit = 'absolute' }: Props) => {
    const total = calculateTotal(data, 'count');

    if (!data || data.length === 0) return null;

    return displayType === 'pie' ? (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="hsl(var(--chart-1))"
                    dataKey="count"
                    stroke="hsl(var(--background))"
                    paddingAngle={2}
                >
                    {data.map((_, index) => <Cell key={`cell-${index}`} fill={getThemeColor(index + 2)} />)}
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
            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tickFormatter={(v) => formatValue(v, total, unit).toString()} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                    formatter={(value: any) => [formatValue(value, total, unit), 'Jobs']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
    );
};