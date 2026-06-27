import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line
} from "recharts";

import HeatmapChart from "./HeatmapChart";
import TreemapChart from "./TreemapChart";
import BubbleChart from "./BubbleChart";
import RadarChart from "./RadarChart";
import CustomTooltip from '../CustomTooltip';
import { CustomLegend } from './CustomLegend';

interface GenericDynamicChartProps {
    chart: any;
    onClose: () => void;
}

const getThemeColor = (index: number) => {
    return `hsl(var(--chart-${(index % 5) + 1}))`;
};

export default function GenericDynamicChart({ chart, onClose }: GenericDynamicChartProps) {
    const isAI = chart.id === 'llmGenerated';

    return (
        <div className="w-full h-full flex flex-col relative">
            <button
                onClick={onClose}
                className="absolute top-0 right-0 z-20 text-xs font-medium bg-destructive text-destructive-foreground px-2 py-1 rounded hover:opacity-80 shadow-sm transition-all"
            >
                Close {isAI ? 'AI Chart' : 'Saved Chart'}
            </button>

            {/* AI Query Display */}
            {chart.query && (
                <div className="absolute top-0 left-0 z-20 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm max-w-[70%] truncate">
                    Query: <span className="text-foreground italic">"{chart.query}"</span>
                </div>
            )}

            {chart.explanation && (
                <div className="mt-8 mb-4 p-4 bg-secondary/30 rounded-lg text-sm text-foreground/80 border border-border">
                    {chart.explanation}
                </div>
            )}

            {/* Chart Container */}
            <div className="flex-grow min-h-0 mt-8">
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    {chart.chartType === 'bar' ? (
                        <BarChart data={chart.data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [value, chart.yAxisLabel || 'Value']}
                            />
                            <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    ) : chart.chartType === 'line' || chart.chartType === 'polyline' ? (
                        <LineChart data={chart.data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [value, chart.yAxisLabel || 'Value']}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    ) : chart.chartType === 'pie' ? (
                        <PieChart margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                            <Pie
                                data={chart.data}
                                cx="50%" cy="50%"
                                labelLine
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="hsl(var(--chart-1))"
                                dataKey="value"
                            >
                                {chart.data.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={getThemeColor(index)} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    ) : chart.chartType === 'heatmap' ? (
                        <HeatmapChart data={chart.data} />
                    ) : chart.chartType === 'treemap' ? (
                        <TreemapChart data={chart.data} />
                    ) : chart.chartType === 'bubble' ? (
                        <BubbleChart data={chart.data} />
                    ) : chart.chartType === 'radar' ? (
                        <RadarChart data={chart.data} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Unsupported chart type from AI/Save: {chart.chartType}
                        </div>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}