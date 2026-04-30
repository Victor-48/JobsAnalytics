import { useEffect, useState } from "react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { fetchJobPostingsOverTime } from "../api/jobApi";

export default function TimeSeriesChart() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchJobPostingsOverTime().then((rawData) => {
            if (rawData) {
                // Convert Map<String, Long> to Array of objects for Recharts
                const formatted = Object.keys(rawData)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Ensure chronological order
                    .map(key => ({
                        date: key,
                        count: rawData[key]
                    }));
                setData(formatted);
            }
        }).catch(console.error);
    }, []);

    if (data.length === 0) return null;

    return (
        <div className="w-full h-full flex flex-col relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 11, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        dy={10}
                        tickFormatter={(tick) => {
                            const d = new Date(tick);
                            return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                        }}
                    />
                    <YAxis 
                        allowDecimals={false} 
                        tick={{fontSize: 11, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false}
                        dx={-10}
                    />
                    <Tooltip 
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        formatter={(value: any) => [value, 'New Jobs']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#f43f5e" 
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