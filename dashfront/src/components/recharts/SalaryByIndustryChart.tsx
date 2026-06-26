import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import CustomTooltip from "../CustomTooltip";

interface Props {
    data: any[];
    isDrillDown: boolean;
    drillDownName?: string;
    isLoading: boolean;
    onIndustryClick: (entry: any) => Promise<void> | void;
    onBackClick: () => void;
}

export const SalaryByIndustryChart = ({
                                          data,
                                          isDrillDown,
                                          drillDownName,
                                          isLoading,
                                          onIndustryClick,
                                          onBackClick
                                      }: Props) => {

    const dataKey = isDrillDown ? "count" : "salary";

    return (
        <div className="w-full h-full flex flex-col relative group pointer-events-auto">

             {isDrillDown && drillDownName && (
                <div className="absolute top-0 left-0 z-20 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
                    Sub-sectors for: <span className="text-foreground">{drillDownName}</span>
                </div>
            )}

            {isDrillDown && (
                <button
                    onClick={onBackClick}
                    className="absolute top-0 right-0 z-20 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1"
                >
                    Back to Industries
                </button>
            )}

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-[1px] rounded-lg">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {(!data || data.length === 0) && !isLoading ? (
                <div className="flex-grow flex items-center justify-center text-muted-foreground text-sm">
                    No sub-sectors found for this industry.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data || []} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip
                            content={<CustomTooltip formatter={(value: any) => [isDrillDown ? value : `$${value}`, isDrillDown ? 'Job Postings' : 'Avg Salary']} />}
                        />
                        <Bar
                            dataKey={dataKey}
                            fill={isDrillDown ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
                            radius={[4, 4, 0, 0]}
                            onClick={!isDrillDown ? onIndustryClick : undefined}
                            cursor={!isDrillDown ? "pointer" : "default"}
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};