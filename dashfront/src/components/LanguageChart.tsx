import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";
import type { ProgrammingLanguage } from "../types/Language.ts";
import "../styles/LanguageChart.css";
import CustomTooltip from "./CustomTooltip";

interface Props {
    languages: ProgrammingLanguage[];
}

export default function LanguageChart({ languages }: Props) {
    return (
        <div className="chart-container w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languages} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        dy={10} 
                        tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}}
                    />

                    <YAxis hide={true} />

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} 
                    />

                    <Bar
                        dataKey="jobCount"
                        fill="url(#colorJobs)"
                        radius={[4, 4, 0, 0]}
                        animationDuration={300}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}