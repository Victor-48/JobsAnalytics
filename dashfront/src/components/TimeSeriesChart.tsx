import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import CustomTooltip from "./CustomTooltip";

interface Props {
    data: any[];
}

export default function TimeSeriesChart({ data }: Props) {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full h-full aspect-video">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} 
                        axisLine={false} 
                        tickLine={false}
                        dy={10}
                        tickFormatter={(tick) => {
                            const d = new Date(tick + "T00:00:00");
                            return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                        }}
                    />
                    <YAxis 
                        allowDecimals={false} 
                        tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} 
                        axisLine={false} 
                        tickLine={false}
                        dx={-10}
                    />
                    <Tooltip content={<CustomTooltip formatter={(value: any) => [value, 'Postings']} />} />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}