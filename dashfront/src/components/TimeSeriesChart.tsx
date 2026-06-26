import { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { fetchJobPostingsOverTime } from "../api/jobApi";
import CustomTooltip from "./CustomTooltip";

export default function TimeSeriesChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchJobPostingsOverTime().then((rawData) => {
            if (rawData) {
                // Convert Map<String, Long> to Array of objects for Recharts
                const formatted = Object.keys(rawData)
                    .sort((a, b) => new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime())
                    .map(key => ({ date: key, count: rawData[key] }));
                setData(formatted);
            }
        }).catch(console.error);
    }, []);

    if (data.length === 0) return null;

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
                    <Tooltip 
                        content={<CustomTooltip labelFormatter={(label: any) => new Date(label + "T00:00:00").toLocaleDateString()} formatter={(value: any) => [value, 'New Jobs']} />}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorCount)" 
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}