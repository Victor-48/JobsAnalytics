import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line
} from "recharts";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import {
    fetchSalaryByIndustry,
    fetchSalaryByExperience,
    fetchRemoteVsOnsiteStats,
    fetchEmploymentTypeDistribution,
    fetchSubSectorsByNaceCode,
    queryLlmChart
} from "../api/jobApi";
import TimeSeriesChart from "./TimeSeriesChart";
import { NACE_SECTORS } from "../pages/AddJob";

import { SortableChartCard } from "./ui/SortableChartCard";
import { FloatingWindow } from "./ui/FloatingWindow";
import { EmptyState } from "./ui/EmptyState";
import { formatValue, calculateTotal } from "../utils/chartUtils";
import { useDragScroll } from "../utils/useDragScroll";

const getThemeColor = (index: number) => {
    return `hsl(var(--chart-${(index % 5) + 1}))`;
};

const initialCharts = [
    { id: 'timeSeries', title: 'Postings Over Time', type: 'line', fullWidth: true },
    { id: 'salaryByIndustry', title: 'Average Salary by Industry', type: 'bar', fullWidth: true },
    { id: 'remoteVsOnsite', title: 'Remote vs Onsite Avg Salary', type: 'bar', fullWidth: true },
    { id: 'employmentType', title: 'Employment Type Breakdown', type: 'pie/bar', fullWidth: true },
    { id: 'jobsByExperience', title: 'Job Postings by Experience Level', type: 'pie/bar', fullWidth: true },
];

const dropAnimationConfig = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
};

export default function AnalyticsCharts({ initialLoadedChart }: { initialLoadedChart?: any }) {
    const [data, setData] = useState({
        salaryByIndustry: [],
        jobsByExperience: [],
        remoteVsOnsite: [],
        employmentType: [],
    });
    
    const [drillDownIndustry, setDrillDownIndustry] = useState<{code: string, name: string} | null>(null);
    const [drillDownData, setDrillDownData] = useState<any[]>([]);
    const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);

    const [llmQuery, setLlmQuery] = useState("");
    const [isLlmLoading, setIsLlmLoading] = useState(false);
    const [llmChartData, setLlmChartData] = useState<any | null>(null);
    const [loadedSavedChart, setLoadedSavedChart] = useState<any | null>(null);

    const [chartOrder, setChartOrder] = useState(initialCharts);
    const [chartDisplay, setChartDisplay] = useState({ employmentType: 'pie', jobsByExperience: 'bar' } as any);
    const [chartUnits, setChartUnits] = useState({ employmentType: 'percentage', jobsByExperience: 'absolute' } as any);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');
    const [focusedChartId, setFocusedChartId] = useState<string>('timeSeries');
    
    const [floatingWindows, setFloatingWindows] = useState<any[]>([]);
    const { ref: scrollRef, events: scrollEvents } = useDragScroll<HTMLDivElement>();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Watch for incoming saved chart from props
    useEffect(() => {
        if (initialLoadedChart) {
            setLoadedSavedChart(initialLoadedChart);
            setViewMode('single');
            setFocusedChartId(initialLoadedChart.id);
            
            // Apply its saved display mode if present
            if (initialLoadedChart.displayType && chartDisplay[initialLoadedChart.id as keyof typeof chartDisplay] !== undefined) {
                setChartDisplay((prev: any) => ({ ...prev, [initialLoadedChart.id]: initialLoadedChart.displayType }));
            }
        }
    }, [initialLoadedChart]);

    useEffect(() => {
        fetchSalaryByIndustry().then(d => {
            if(d) {
                const formatted = Object.keys(d).map(key => {
                    const nace = NACE_SECTORS.find((n: any) => n.code === key);
                    return { 
                        code: key,
                        name: nace ? (nace.description.length > 20 ? nace.description.substring(0, 20) + '...' : nace.description) : key, 
                        salary: Math.round(d[key]) 
                    };
                });
                setData(prev => ({ ...prev, salaryByIndustry: formatted as any }));
            }
        }).catch(console.error);

        fetchSalaryByExperience().then(d => d && setData(prev => ({ ...prev, jobsByExperience: Object.keys(d).map(key => ({ name: key, count: d[key] })) as any }))).catch(console.error);
        fetchRemoteVsOnsiteStats().then(d => d && setData(prev => ({ ...prev, remoteVsOnsite: Object.keys(d).map(key => ({ name: key, salary: Math.round(d[key]) })) as any }))).catch(console.error);
        fetchEmploymentTypeDistribution().then(d => d && setData(prev => ({ ...prev, employmentType: Object.keys(d).map(key => ({ name: key, count: d[key] })) as any }))).catch(console.error);
    }, []);

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        setActiveId(null);
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setChartOrder((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const toggleChartType = (chartName: keyof typeof chartDisplay) => {
        setChartDisplay((prev: any) => ({ ...prev, [chartName]: prev[chartName] === 'pie' ? 'bar' : 'pie' }));
    };

    const toggleChartUnit = (chartName: keyof typeof chartUnits) => {
        setChartUnits((prev: any) => ({ ...prev, [chartName]: prev[chartName] === 'absolute' ? 'percentage' : 'absolute' }));
    };

    const handleIndustryClick = async (entry: any) => {
        if (drillDownIndustry && drillDownIndustry.code === entry.code) {
            setDrillDownIndustry(null);
            setDrillDownData([]);
        } else {
            setDrillDownIndustry({ code: entry.code, name: entry.name });
            setIsDrillDownLoading(true);
            try {
                const fetchCode = entry.code; 
                const d = await fetchSubSectorsByNaceCode(fetchCode);
                if (d) {
                    setDrillDownData(Object.keys(d).map(key => ({ name: key.length > 20 ? key.substring(0, 20) + '...' : key, count: d[key] })));
                } else {
                    setDrillDownData([]);
                }
            } catch (e) {
                console.error(e);
                setDrillDownData([]);
            } finally {
                setIsDrillDownLoading(false);
            }
        }
    };

    const handleLlmSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!llmQuery.trim()) return;

        setIsLlmLoading(true);
        try {
            const result = await queryLlmChart(llmQuery);
            setLlmChartData({ id: 'llmGenerated', fullWidth: true, query: llmQuery, ...result });
            if (viewMode === 'single') {
                setFocusedChartId('llmGenerated');
            }
        } catch (error) {
            console.error("Failed to fetch LLM chart", error);
        } finally {
            setIsLlmLoading(false);
        }
    };

    const toggleFloatingWindow = (chart: any) => {
        if (floatingWindows.find(w => w.id === chart.id)) {
            setFloatingWindows(prev => prev.filter(w => w.id !== chart.id));
        } else {
            setFloatingWindows(prev => [...prev, chart]);
        }
    };

    // --- Save Chart Logic ---
    const handleSaveChart = (chartId: string) => {
        let chartToSave: any = null;
        let finalData: any = null;
        let finalCategory = "custom";

        if (chartId === 'llmGenerated' && llmChartData) {
            chartToSave = llmChartData;
            finalData = llmChartData.data;
            finalCategory = "AI Generated";
        } else if (chartId === loadedSavedChart?.id) {
            chartToSave = loadedSavedChart;
            finalData = loadedSavedChart.data;
            finalCategory = loadedSavedChart.category;
        } else {
            chartToSave = activeCharts.find(c => c.id === chartId);
            if (!chartToSave) return;
            
            // Determine the data payload and category based on standard chart ID
            if (chartId === 'timeSeries') {
                // Time series data is not easily extracted directly from state here without refactoring TimeSeriesChart to take props
                // For MVP, we will show an alert that standard time series cannot be saved this way.
                alert("Please use the AI assistant to generate and save custom time series data.");
                return;
            } else if (chartId === 'salaryByIndustry') {
                finalData = drillDownIndustry ? drillDownData : data.salaryByIndustry;
                finalCategory = "Salary";
            } else if (chartId === 'remoteVsOnsite') {
                finalData = data.remoteVsOnsite;
                finalCategory = "Salary";
            } else if (chartId === 'employmentType') {
                finalData = data.employmentType;
                finalCategory = "Jobs";
            } else if (chartId === 'jobsByExperience') {
                finalData = data.jobsByExperience;
                finalCategory = "Jobs";
            }
        }

        if (!chartToSave || !finalData) return;

        const newSavedInsight = {
            id: `saved_${Date.now()}_${chartToSave.id}`, // Unique ID
            title: chartToSave.title || "Custom Insight",
            chartType: chartToSave.chartType || (chartToSave.type && !chartToSave.type.includes('/') ? chartToSave.type : (chartDisplay[chartId as keyof typeof chartDisplay] || 'bar')),
            data: finalData,
            timestamp: Date.now(),
            category: finalCategory,
            query: chartToSave.query || undefined,
            displayType: chartDisplay[chartId as keyof typeof chartDisplay] || undefined,
            displayUnit: chartUnits[chartId as keyof typeof chartUnits] || undefined
        };

        const existingStr = localStorage.getItem('savedInsights');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const newSavedList = [newSavedInsight, ...existing];
        
        localStorage.setItem('savedInsights', JSON.stringify(newSavedList));
        
        // Dispatch custom event to notify SavedInsights component in sidebar
        window.dispatchEvent(new Event('insightsUpdated'));
        alert(`Insight "${newSavedInsight.title}" saved successfully!`);
    };

    const activeCharts = chartOrder.filter(chart =>
        chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chart.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (data.salaryByIndustry.length === 0 && data.jobsByExperience.length === 0) {
        return <EmptyState />;
    }

    const renderChart = (chart: any) => {
        if (chart.id === 'llmGenerated' || (chart.id && chart.id.startsWith('saved_') && chart === loadedSavedChart)) {
            const isAI = chart.id === 'llmGenerated';
            return (
                <div className="w-full h-full flex flex-col relative">
                     <button 
                        onClick={() => {
                            if (isAI) {
                                setLlmChartData(null);
                            } else {
                                setLoadedSavedChart(null);
                            }
                            setFocusedChartId(activeCharts[0]?.id || '');
                        }}
                        className="absolute top-0 right-0 z-20 text-xs font-medium bg-destructive text-destructive-foreground px-2 py-1 rounded hover:opacity-80 shadow-sm transition-all"
                    >
                        Close {isAI ? 'AI Chart' : 'Saved Chart'}
                    </button>
                    {chart.query && (
                         <div className="absolute top-0 left-0 z-20 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm max-w-[70%] truncate">
                            Query: <span className="text-foreground italic">"{chart.query}"</span>
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        {chart.chartType === 'bar' ? (
                            <BarChart data={chart.data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        ) : chart.chartType === 'line' || chart.chartType === 'polyline' ? (
                             <LineChart data={chart.data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                            </LineChart>
                        ) : chart.chartType === 'pie' ? (
                             <PieChart margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
                                <Pie data={chart.data} cx="50%" cy="50%" labelLine label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(0)}%`} outerRadius={100} fill="hsl(var(--chart-1))" dataKey="value">
                                    {chart.data.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={getThemeColor(index)} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                            </PieChart>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type from AI/Save</div>
                        )}
                    </ResponsiveContainer>
                </div>
            );
        }

        switch (chart.id) {
            case 'timeSeries':
                return <TimeSeriesChart />;
            case 'salaryByIndustry':
                const displayData = drillDownIndustry ? drillDownData : data.salaryByIndustry;
                const dataKey = drillDownIndustry ? "count" : "salary";
                const isDrillDown = drillDownIndustry !== null;

                return (
                    <div className="w-full h-full flex flex-col relative group pointer-events-auto">
                        {isDrillDown && (
                            <button 
                                onClick={() => setDrillDownIndustry(null)}
                                className="absolute top-0 right-0 z-20 text-xs font-medium bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full shadow-md transition-all flex items-center gap-1"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                Back to Industries
                            </button>
                        )}
                        {isDrillDown && (
                            <div className="absolute top-0 left-0 z-20 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded backdrop-blur-sm">
                                Sub-sectors for: <span className="text-foreground">{drillDownIndustry.name}</span>
                            </div>
                        )}
                        
                        {isDrillDownLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 backdrop-blur-[1px]">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : null}

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={displayData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                                <Tooltip 
                                    formatter={(value: any) => [isDrillDown ? value : `$${value}`, isDrillDown ? 'Job Postings' : 'Avg Salary']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar 
                                    dataKey={dataKey} 
                                    fill={isDrillDown ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"} 
                                    radius={[4, 4, 0, 0]}
                                    onClick={!isDrillDown ? handleIndustryClick : undefined}
                                    cursor={!isDrillDown ? "pointer" : "default"}
                                    animationDuration={500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            case 'remoteVsOnsite':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.remoteVsOnsite} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip 
                                formatter={(value: any) => [`$${value}`, 'Avg Salary']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="salary" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'employmentType': {
                const totalEmp = calculateTotal(data.employmentType, 'count');
                const unitEmp = chartUnits.employmentType;
                
                return chartDisplay.employmentType === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data.employmentType} 
                                cx="50%" cy="50%" 
                                innerRadius={60}
                                outerRadius={90} 
                                fill="hsl(var(--chart-1))" 
                                dataKey="count"
                                stroke="hsl(var(--background))"
                                paddingAngle={2}
                            >
                                {data.employmentType.map((_, index) => <Cell key={`cell-${index}`} fill={getThemeColor(index)} />)}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any) => [formatValue(value, totalEmp, unitEmp), 'Jobs']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.employmentType} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tickFormatter={(v) => formatValue(v, totalEmp, unitEmp).toString()} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                formatter={(value: any) => [formatValue(value, totalEmp, unitEmp), 'Jobs']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }
            case 'jobsByExperience': {
                const totalExp = calculateTotal(data.jobsByExperience, 'count');
                const unitExp = chartUnits.jobsByExperience;
                
                return chartDisplay.jobsByExperience === 'pie' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data.jobsByExperience} 
                                cx="50%" cy="50%" 
                                innerRadius={70}
                                outerRadius={110} 
                                fill="hsl(var(--chart-1))" 
                                dataKey="count"
                                stroke="hsl(var(--background))"
                                paddingAngle={2}
                            >
                                {data.jobsByExperience.map((_, index) => <Cell key={`cell-${index}`} fill={getThemeColor(index + 2)} />)}
                            </Pie>
                            <Tooltip 
                                formatter={(value: any) => [formatValue(value, totalExp, unitExp), 'Jobs']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.jobsByExperience} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tickFormatter={(v) => formatValue(v, totalExp, unitExp).toString()} tick={{fontSize: 11, fill: 'hsl(var(--muted-foreground))'}} axisLine={false} tickLine={false} dx={-10} />
                            <Tooltip 
                                formatter={(value: any) => [formatValue(value, totalExp, unitExp), 'Jobs']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Natural Language to SQL/Charts Search Box */}
            <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border mb-8 transition-colors">
                <div className="mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Ask your Data (AI Assistant)</h3>
                </div>
                <form onSubmit={handleLlmSearch} className="relative flex gap-3">
                    <div className="relative w-full">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                            type="text"
                            placeholder="e.g., 'Arată-mi evoluția joburilor în IT din Cluj pe ultimii 3 ani sub formă de linie'"
                            value={llmQuery}
                            onChange={(e) => setLlmQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none shadow-sm text-foreground"
                            disabled={isLlmLoading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLlmLoading || !llmQuery.trim()}
                        className="bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        {isLlmLoading ? (
                            <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div> Generating...</>
                        ) : (
                            'Generate Chart'
                        )}
                    </button>
                </form>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-foreground">Standard Analytics</h2>
                
                <div className="flex items-center gap-4">
                    {/* View Mode Toggles */}
                    <div className="flex bg-secondary p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('single')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'single' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Focus View
                        </button>
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Grid View
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64 group">
                        <input
                            type="text"
                            placeholder="Filter standard charts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-1.5 bg-background border border-input text-foreground rounded-full text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {viewMode === 'single' ? (
                <div className="flex flex-col gap-6">
                    {/* Interactive Draggable Scroll Bar */}
                    <div className="relative group w-full mx-auto select-none">
                        <div
                            ref={scrollRef}
                            {...scrollEvents}
                            className="flex gap-3 overflow-x-auto no-scrollbar py-2 px-4 scroll-smooth snap-x snap-mandatory"
                            style={{ 
                                cursor: 'grab', 
                                WebkitOverflowScrolling: 'touch',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none'
                            }}
                        >
                            {loadedSavedChart && (
                                <button
                                    onClick={() => setFocusedChartId(loadedSavedChart.id)}
                                    className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${focusedChartId === loadedSavedChart.id ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                                >
                                    Saved: {loadedSavedChart.title}
                                </button>
                            )}
                            {llmChartData && (
                                <button
                                    onClick={() => setFocusedChartId('llmGenerated')}
                                    className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${focusedChartId === 'llmGenerated' ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                                >
                                    AI: {llmChartData.title}
                                </button>
                            )}
                            {activeCharts.map(chart => (
                                <button
                                    key={chart.id}
                                    onClick={() => setFocusedChartId(chart.id)}
                                    className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${focusedChartId === chart.id ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                                >
                                    {chart.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* The Focused Chart */}
                    <div className="w-full min-h-[500px]">
                        {focusedChartId === 'llmGenerated' && llmChartData ? (
                            <SortableChartCard 
                                chart={{...llmChartData, fullWidth: true}}
                                onToggleFloat={() => toggleFloatingWindow(llmChartData)}
                                isFloating={floatingWindows.some(w => w.id === 'llmGenerated')}
                                onSave={() => handleSaveChart('llmGenerated')}
                            >
                                {renderChart(llmChartData)}
                            </SortableChartCard>
                        ) : focusedChartId === loadedSavedChart?.id ? (
                            <SortableChartCard 
                                chart={{...loadedSavedChart, fullWidth: true}}
                                onToggleFloat={() => toggleFloatingWindow(loadedSavedChart)}
                                isFloating={floatingWindows.some(w => w.id === loadedSavedChart.id)}
                            >
                                {renderChart(loadedSavedChart)}
                            </SortableChartCard>
                        ) : activeCharts.find(c => c.id === focusedChartId) ? (
                            <SortableChartCard
                                chart={{...activeCharts.find(c => c.id === focusedChartId), fullWidth: true}}
                                onToggleType={activeCharts.find(c => c.id === focusedChartId)?.type.includes('/') ? () => toggleChartType(focusedChartId as keyof typeof chartDisplay) : undefined}
                                displayType={activeCharts.find(c => c.id === focusedChartId)?.type.includes('/') ? chartDisplay[focusedChartId as keyof typeof chartDisplay] : undefined}
                                onToggleUnit={['employmentType', 'jobsByExperience'].includes(focusedChartId) ? () => toggleChartUnit(focusedChartId as keyof typeof chartUnits) : undefined}
                                displayUnit={['employmentType', 'jobsByExperience'].includes(focusedChartId) ? chartUnits[focusedChartId as keyof typeof chartUnits] : undefined}
                                onToggleFloat={() => toggleFloatingWindow(activeCharts.find(c => c.id === focusedChartId))}
                                isFloating={floatingWindows.some(w => w.id === focusedChartId)}
                                onSave={() => handleSaveChart(focusedChartId)}
                            >
                                {renderChart(activeCharts.find(c => c.id === focusedChartId))}
                            </SortableChartCard>
                        ) : null}
                    </div>
                </div>
            ) : (
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={activeCharts.map(c => c.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full auto-rows-min relative">
                            {loadedSavedChart && (
                                <SortableChartCard chart={loadedSavedChart}>
                                    {renderChart(loadedSavedChart)}
                                </SortableChartCard>
                            )}
                            {llmChartData && (
                                <SortableChartCard chart={llmChartData} onSave={() => handleSaveChart('llmGenerated')}>
                                    {renderChart(llmChartData)}
                                </SortableChartCard>
                            )}
                            {activeCharts.map(chart => (
                                <SortableChartCard
                                    key={chart.id}
                                    chart={chart}
                                    onToggleType={chart.type.includes('/') ? () => toggleChartType(chart.id as keyof typeof chartDisplay) : undefined}
                                    displayType={chart.type.includes('/') ? chartDisplay[chart.id as keyof typeof chartDisplay] : undefined}
                                    onToggleUnit={['employmentType', 'jobsByExperience'].includes(chart.id) ? () => toggleChartUnit(chart.id as keyof typeof chartUnits) : undefined}
                                    displayUnit={['employmentType', 'jobsByExperience'].includes(chart.id) ? chartUnits[chart.id as keyof typeof chartUnits] : undefined}
                                    onToggleFloat={() => toggleFloatingWindow(chart)}
                                    isFloating={floatingWindows.some(w => w.id === chart.id)}
                                    onSave={() => handleSaveChart(chart.id)}
                                >
                                    {renderChart(chart)}
                                </SortableChartCard>
                            ))}
                        </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {activeId ? (
                            <SortableChartCard
                                chart={activeCharts.find(c => c.id === activeId)}
                                displayType={activeCharts.find(c => c.id === activeId)?.type.includes('/') ? chartDisplay[activeId as keyof typeof chartDisplay] : undefined}
                                displayUnit={['employmentType', 'jobsByExperience'].includes(activeId) ? chartUnits[activeId as keyof typeof chartUnits] : undefined}
                            >
                                {renderChart(activeCharts.find(c => c.id === activeId))}
                            </SortableChartCard>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Floating Windows Container */}
            {floatingWindows.length > 0 && (
                <>
                    {floatingWindows.map((chart, index) => (
                        <FloatingWindow key={`floating-${chart.id}`} chart={chart} index={index} onClose={() => toggleFloatingWindow(chart)}>
                            {renderChart(chart)}
                        </FloatingWindow>
                    ))}
                </>
            )}
        </div>
    );
}