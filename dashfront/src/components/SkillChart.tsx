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
import "../styles/SkillChart.css";
import CustomTooltip from "./CustomTooltip";

interface TopSkill {
    name: string;
    count: number;
}

interface Props {
    skills: TopSkill[];
}

export default function SkillChart({ skills }: Props) {
    return (
        <div className="chart-container w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={skills} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
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
                        dataKey="count"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.8}
                        radius={[4, 4, 0, 0]}
                        animationDuration={300}
                        barSize={30}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
