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
        // Add a class to the container for styling
        <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={languages} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    {/* Define the gradient */}
                    <defs>
                        <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        </linearGradient>
                    </defs>

                    {/* Make grid lines lighter and remove vertical lines */}
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />

                    {/* Declutter X-axis: remove axis line and tick lines */}
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        dy={10} // Push labels down a bit
                    />

                    {/* Hide the Y-axis for a cleaner look */}
                    <YAxis hide={true} />

                    {/* Use the new CustomTooltip */}
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} // Light blue hover
                    />

                    {/* Apply gradient, add rounded corners, and a subtle animation */}
                    <Bar
                        dataKey="jobCount"
                        fill="url(#colorJobs)"
                        radius={[4, 4, 0, 0]} // [topLeft, topRight, bottomRight, bottomLeft]
                        animationDuration={300}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}