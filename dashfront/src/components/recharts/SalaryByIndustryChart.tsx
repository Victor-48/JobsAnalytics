import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { fetchSubSectorsByNaceCode } from '../../api/jobApi';

export const SalaryByIndustryChart = () => {
    const { data, isLoading: isInitialLoading } = useAnalytics();
    const [drillDownIndustry, setDrillDownIndustry] = useState<{code: string, name: string} | null>(null);
    const [drillDownData, setDrillDownData] = useState<any[]>([]);
    const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);

    const handleIndustryClick = async (entry: any) => {
        if (drillDownIndustry && drillDownIndustry.code === entry.code) {
            setDrillDownIndustry(null);
            setDrillDownData([]);
        } else {
            setDrillDownIndustry({ code: entry.code, name: entry.name });
            setIsDrillDownLoading(true);
            try {
                const d = await fetchSubSectorsByNaceCode(entry.code);
                setDrillDownData(d ? Object.keys(d).map(key => ({ name: key.length > 20 ? key.substring(0, 20) + '...' : key, count: d[key] })) : []);
            } catch (e) {
                console.error(e);
            } finally {
                setIsDrillDownLoading(false);
            }
        }
    };

    const displayData = drillDownIndustry ? drillDownData : data.salaryByIndustry;
    const dataKey = drillDownIndustry ? "count" : "salary";
    const isDrillDown = drillDownIndustry !== null;

    if (isInitialLoading) return <div>Loading...</div>;

    return (
        <div className="w-full h-full flex flex-col relative group">
            {isDrillDown && (
                <button 
                    onClick={() => setDrillDownIndustry(null)}
                    className="absolute top-0 right-0 z-20 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1"
                >
                    Back to Industries
                </button>
            )}
            {isDrillDownLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-[1px]">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                        formatter={(value: any) => [isDrillDown ? value : `$${value}`, isDrillDown ? 'Job Postings' : 'Avg Salary']}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }} 
                    />
                    <Bar 
                        dataKey={dataKey} 
                        fill={isDrillDown ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"} 
                        radius={[4, 4, 0, 0]}
                        onClick={!isDrillDown ? handleIndustryClick : undefined}
                        cursor={!isDrillDown ? "pointer" : "default"}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
