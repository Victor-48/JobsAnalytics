import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
    data: any[];
}

export const RemoteVsOnsiteChart = ({ data }: Props) => {
    if (!data || data.length === 0) return null;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip
                    formatter={(value: any) => [`$${value}`, 'Avg Salary']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="salary" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
        </ResponsiveContainer>
    );
};