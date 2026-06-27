import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { EmergingTech } from "../../api/jobApi";

interface Props {
    data: EmergingTech[];
}

const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-40} y={0} width={80} height={100}>
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '11px', color: 'hsl(var(--muted-foreground))', wordWrap: 'break-word', lineHeight: '1.2' }}>
                    {payload.value}
                </div>
            </foreignObject>
        </g>
    );
};

export const EmergingTechChart = ({ data }: Props) => {
    if (!data || data.length === 0) {
        return <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <defs>
                    <linearGradient id="etiGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                    dataKey="skillName" 
                    tick={<CustomTick />} 
                    interval={0} 
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                />
                <YAxis 
                    yAxisId="left"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    domain={[0, 100]}
                />
                <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    tickFormatter={(val) => `+${val}%`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: any, name: string) => [
                        name === 'etiScore' ? value.toFixed(1) : name === 'growth' ? `+${value.toFixed(1)}%` : value, 
                        name === 'etiScore' ? 'ETI Score' : name === 'growth' ? 'Growth' : name
                    ]}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar yAxisId="left" dataKey="etiScore" name="ETI Score (0-100)" fill="url(#etiGradient)" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="growth" name="Growth %" stroke="hsl(var(--destructive))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
        </ResponsiveContainer>
    );
};
