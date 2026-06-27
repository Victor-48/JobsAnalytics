import React, { useEffect, useState } from "react";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor,
    useSensor, useSensors, DragOverlay, defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy,
} from '@dnd-kit/sortable';

import { useAnalytics } from "../contexts/AnalyticsContext";

// APIs like drilldown and LLM)
import { fetchSubSectorsByNaceCode, queryLlmChart } from "../api/jobApi";
import { toast } from "sonner";
import { SortableChartCard } from "./ui/SortableChartCard";
import { FloatingWindow } from "./ui/FloatingWindow";
import { EmptyState } from "./ui/EmptyState";
import TimeSeriesChart from "./TimeSeriesChart";

import {SalaryByIndustryChart} from "./recharts/SalaryByIndustryChart";
import {RemoteVsOnsiteChart} from "./recharts/RemoteVsOnsiteChart";
import {EmploymentTypeChart} from "./recharts/EmploymentTypeChart";
import {JobsByExperienceChart} from "./recharts/JobsByExperienceChart";
import {EmergingTechChart} from "./recharts/EmergingTechChart";
import GenericDynamicChart from "./recharts/GenericDynamicChart";
import {useDragScroll} from "../utils/useDragScroll";
import SkillChart from "./SkillChart";

const initialCharts = [
    { id: 'timeSeries', title: 'Postings Over Time', type: 'line', fullWidth: true },
    { id: 'salaryByIndustry', title: 'Average Salary by Industry', type: 'bar', fullWidth: true },
    { id: 'remoteVsOnsite', title: 'Remote vs Onsite Avg Salary', type: 'bar', fullWidth: true },
    { id: 'employmentType', title: 'Employment Type Breakdown', type: 'pie/bar', fullWidth: true },
    { id: 'jobsByExperience', title: 'Job Postings by Experience Level', type: 'pie/bar', fullWidth: true },
    { id: 'topSkills', title: 'Most In-Demand Skills', type: 'bar', fullWidth: true },
    { id: 'emergingTech', title: 'Emerging Tech Index', type: 'composed', fullWidth: true },
];

const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
};

export default function AnalyticsCharts({ initialLoadedChart, viewMode, onViewModeChange, focusedChartId, onFocusedChartIdChange }: { initialLoadedChart?: any, viewMode: 'grid' | 'single', onViewModeChange: (mode: 'grid' | 'single') => void, focusedChartId?: string, onFocusedChartIdChange?: (id: string) => void }) {
    const { data: analyticsData, isLoading: isDataLoading } = useAnalytics();

    const [drillDownIndustry, setDrillDownIndustry] = useState<{code: string, name: string} | null>(null);
    const [drillDownData, setDrillDownData] = useState<any[]>([]);
    const [isDrillDownLoading, setIsDrillDownLoading] = useState(false);

    const [llmQuery, setLlmQuery] = useState("");
    const [isLlmLoading, setIsLlmLoading] = useState(false);
    const [llmError, setLlmError] = useState<string | null>(null);
    const [llmChartData, setLlmChartData] = useState<any | null>(null);
    const [loadedSavedChart, setLoadedSavedChart] = useState<any | null>(null);

    const [chartOrder, setChartOrder] = useState(initialCharts);
    const [chartDisplay, setChartDisplay] = useState({ employmentType: 'pie', jobsByExperience: 'bar' } as any);
    const [chartUnits, setChartUnits] = useState({ employmentType: 'percentage', jobsByExperience: 'absolute' } as any);
    const [chartSorts, setChartSorts] = useState({} as any);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeId, setActiveId] = useState<string | null>(null);
    const [internalFocusedChartId, setInternalFocusedChartId] = useState<string>('timeSeries');
    const currentChartId = focusedChartId !== undefined ? focusedChartId : internalFocusedChartId;
    const setCurrentChartId = onFocusedChartIdChange || setInternalFocusedChartId;
    const [floatingWindows, setFloatingWindows] = useState<any[]>([]);
    const { ref: scrollRef, events: scrollEvents } = useDragScroll<HTMLDivElement>();


    useEffect(() => {
        if (initialLoadedChart) {
            setLoadedSavedChart(initialLoadedChart);
            onViewModeChange('single');
            setFocusedChartId(initialLoadedChart.id);
            if (initialLoadedChart.displayType && chartDisplay[initialLoadedChart.id as keyof typeof chartDisplay] !== undefined) {
                setChartDisplay((prev: any) => ({ ...prev, [initialLoadedChart.id]: initialLoadedChart.displayType }));
            }
        }
    }, [initialLoadedChart]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: any) => setActiveId(event.active.id);
    const handleDragCancel = () => setActiveId(null);
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

    const toggleChartType = (chartName: keyof typeof chartDisplay) => setChartDisplay((prev: any) => ({ ...prev, [chartName]: prev[chartName] === 'pie' ? 'bar' : 'pie' }));
    const toggleChartUnit = (chartName: keyof typeof chartUnits) => setChartUnits((prev: any) => ({ ...prev, [chartName]: prev[chartName] === 'absolute' ? 'percentage' : 'absolute' }));
    const toggleFloatingWindow = (chart: any) => setFloatingWindows(prev => prev.find(w => w.id === chart.id) ? prev.filter(w => w.id !== chart.id) : [...prev, chart]);
    
    const toggleChartSort = (chartId: string) => {
        setChartSorts((prev: any) => {
            const current = prev[chartId] || 'asc';
            const next = current === 'asc' ? 'desc' : current === 'desc' ? 'none' : 'asc';
            return { ...prev, [chartId]: next };
        });
    };

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
        setLlmError(null);
        try {
            const result = await queryLlmChart(llmQuery);
            setLlmChartData({ id: 'llmGenerated', fullWidth: true, query: llmQuery, ...result });
            if (viewMode === 'single') setFocusedChartId('llmGenerated');
        } catch (error: any) {
            setLlmError(error.response?.data?.error || error.message || "An error occurred.");
        } finally {
            setIsLlmLoading(false);
        }
    };

    const handleSaveChart = (chartId: string) => {
        let chartToSave: any, finalData: any, finalCategory = "Custom Queries";

        if (chartId === 'llmGenerated' && llmChartData) {
            chartToSave = llmChartData; finalData = llmChartData.data; finalCategory = "AI Generated";
        } else if (chartId === loadedSavedChart?.id) {
            chartToSave = loadedSavedChart; finalData = loadedSavedChart.data; finalCategory = loadedSavedChart.category;
        } else {
            chartToSave = activeCharts.find(c => c.id === chartId);
            if (!chartToSave) return;
            if (chartId === 'timeSeries') { finalData = analyticsData.postingsOverTime; finalCategory = "Trends"; }
            if (chartId === 'salaryByIndustry') { finalData = drillDownIndustry ? drillDownData : analyticsData.salaryByIndustry; finalCategory = "Salary & Compensation"; }
            if (chartId === 'remoteVsOnsite') { finalData = analyticsData.remoteVsOnsite; finalCategory = "Salary & Compensation"; }
            if (chartId === 'employmentType') { finalData = analyticsData.employmentType; finalCategory = "Number of Jobs"; }
            if (chartId === 'jobsByExperience') { finalData = analyticsData.jobsByExperience; finalCategory = "Number of Jobs"; }
            if (chartId === 'topSkills') { finalData = analyticsData.topSkills; finalCategory = "Skills"; }
        }

        if (!chartToSave || !finalData) return;

        const newSavedInsight = {
            id: `saved_${Date.now()}_${chartToSave.id}`,
            title: chartToSave.title || "Custom Insight",
            chartType: chartToSave.chartType || (chartToSave.type && !chartToSave.type.includes('/') ? chartToSave.type : (chartDisplay[chartId as keyof typeof chartDisplay] || 'bar')),
            data: finalData,
            timestamp: Date.now(),
            category: finalCategory,
            query: chartToSave.query,
            explanation: chartToSave.explanation,
            displayType: chartDisplay[chartId as keyof typeof chartDisplay],
            displayUnit: chartUnits[chartId as keyof typeof chartUnits]
        };

        const existing = JSON.parse(localStorage.getItem('savedInsights') || '[]');
        localStorage.setItem('savedInsights', JSON.stringify([newSavedInsight, ...existing]));
        window.dispatchEvent(new Event('insightsUpdated'));
        toast.success("Insight Saved!", {
            description: `"${newSavedInsight.title}" has been added to your Saved Insights.`,
            action: {
                label: "Dismiss",
                onClick: () => console.log("Dismissed"),
            },
        });
    };

    const activeCharts = chartOrder.filter(chart => chart.title.toLowerCase().includes(searchQuery.toLowerCase()) || chart.type.toLowerCase().includes(searchQuery.toLowerCase()));

    // Wait for context to load initial data
    if (isDataLoading && analyticsData.salaryByIndustry.length === 0) {
        return <div className="h-96 flex items-center justify-center">Loading Analytics...</div>;
    }

    if (!isDataLoading && analyticsData.salaryByIndustry.length === 0 && analyticsData.jobsByExperience.length === 0) {
        return <EmptyState />;
    }
    
    const applySort = (data: any[], sortMode: string, valueKey: string) => {
        if (!sortMode || sortMode === 'none' || !data) return data;
        return [...data].sort((a, b) => {
            if (sortMode === 'asc') return (a[valueKey] || 0) - (b[valueKey] || 0);
            return (b[valueKey] || 0) - (a[valueKey] || 0);
        });
    };

    // Modularized Render function
    const renderChart = (chart: any) => {
        if (chart.id === 'llmGenerated' || chart.id === loadedSavedChart?.id) {
            return (
                <GenericDynamicChart
                    chart={chart}
                    onClose={() => {
                        if (chart.id === 'llmGenerated') {
                            setLlmChartData(null);
                        } else {
                            setLoadedSavedChart(null);
                        }
                        setCurrentChartId('timeSeries');
                    }}
                />
            );
        } else if (chart.id === 'emergingTech') {
            return <EmergingTechChart data={analyticsData?.emergingTech || []} />;
        }
        
        const sortMode = chartSorts[chart.id as keyof typeof chartSorts] || 'asc';

        switch (chart.id) {
            case 'timeSeries':
                return <TimeSeriesChart data={analyticsData.postingsOverTime} />;
            case 'salaryByIndustry':
                return (
                    <SalaryByIndustryChart
                        data={applySort(drillDownIndustry ? drillDownData : analyticsData.salaryByIndustry, sortMode, drillDownIndustry ? 'count' : 'salary')}
                        isDrillDown={!!drillDownIndustry}
                        drillDownName={drillDownIndustry?.name}
                        isLoading={isDrillDownLoading}
                        onIndustryClick={handleIndustryClick}
                        onBackClick={() => { setDrillDownIndustry(null); setDrillDownData([]); }}
                    />
                );
            case 'remoteVsOnsite':
                return <RemoteVsOnsiteChart data={applySort(analyticsData.remoteVsOnsite, sortMode, 'salary')} />;
            case 'employmentType':
                return (
                    <EmploymentTypeChart
                        data={applySort(analyticsData.employmentType, sortMode, 'count')}
                        displayType={chartDisplay.employmentType}
                        unit={chartUnits.employmentType}
                    />
                );
            case 'jobsByExperience':
                return (
                    <JobsByExperienceChart
                        data={applySort(analyticsData.jobsByExperience, sortMode, 'count')}
                        displayType={chartDisplay.jobsByExperience}
                        unit={chartUnits.jobsByExperience}
                    />
                );
            case 'topSkills':
                return <SkillChart skills={applySort(analyticsData.topSkills, sortMode, 'count')} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">

            {/* --- AI ASSISTANT INPUT --- */}
            <div id="ai-assistant-input" className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border mb-8 transition-colors">
                <div className="mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Ask your Data (AI Assistant)</h3>
                </div>
                {llmError && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
                        {llmError}
                    </div>
                )}
                <form onSubmit={handleLlmSearch} className="relative flex gap-3">
                    <div className="relative w-full">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        <input
                            id="ask-your-data-input"
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

            {/* --- HEADER & CONTROLS --- */}
            <div id="standard-analytics-charts" className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-foreground">Standard Analytics</h2>
                <div className="flex items-center gap-4">
                    <div className="flex bg-secondary p-1 rounded-lg">
                        <button onClick={() => onViewModeChange("single")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "single" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Focus View</button>
                        <button onClick={() => onViewModeChange("grid")} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Grid View</button>
                    </div>
                    <div className="relative w-full sm:w-64 group">
                        <input type="text" placeholder="Filter standard charts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-1.5 bg-background border border-input text-foreground rounded-full text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none" />
                    </div>
                </div>
            </div>

            {/* --- SINGLE VIEW (FOCUS MODE) --- */}
            {viewMode === 'single' && (
                <div id="standard-analytics-buttons" className="flex flex-col gap-6">
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
                            {llmChartData && (
                                <button onClick={() => setCurrentChartId('llmGenerated')} className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${currentChartId === 'llmGenerated' ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>AI Generated Chart</button>
                            )}
                            {loadedSavedChart && (
                                <button onClick={() => setCurrentChartId(loadedSavedChart.id)} className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${currentChartId === loadedSavedChart.id ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{loadedSavedChart.title}</button>
                            )}
                            {activeCharts.map((chart) => (
                                <button id={chart.id === 'salaryByIndustry' ? 'tutorial-salary-btn' : undefined} key={chart.id} onClick={() => setCurrentChartId(chart.id)} className={`chart-btn min-w-[200px] flex-shrink-0 px-4 py-3 rounded-xl border text-sm font-medium transition-all snap-center ${currentChartId === chart.id ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>{chart.title}</button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full min-h-[500px]">
                        {(() => {
                            let activeChart = activeCharts.find(c => c.id === currentChartId);
                            if (currentChartId === 'llmGenerated') activeChart = llmChartData;
                            if (currentChartId === loadedSavedChart?.id) activeChart = loadedSavedChart;

                            if (!activeChart) return <div className="text-center text-muted-foreground">Chart not found</div>;

                            return (
                                <SortableChartCard
                                    chart={{...activeChart, fullWidth: true}}
                                    onToggleType={activeChart.type?.includes('/') ? () => toggleChartType(activeChart.id as keyof typeof chartDisplay) : undefined}
                                    displayType={activeChart.type?.includes('/') ? chartDisplay[activeChart.id as keyof typeof chartDisplay] : undefined}
                                    onToggleUnit={['employmentType', 'jobsByExperience'].includes(activeChart.id) ? () => toggleChartUnit(activeChart.id as keyof typeof chartUnits) : undefined}
                                    displayUnit={['employmentType', 'jobsByExperience'].includes(activeChart.id) ? chartUnits[activeChart.id as keyof typeof chartUnits] : undefined}
                                    onToggleFloat={() => toggleFloatingWindow(activeChart)}
                                    isFloating={floatingWindows.some(w => w.id === activeChart.id)}
                                    onSave={() => handleSaveChart(activeChart.id)}
                                    onToggleSort={activeChart.id !== 'timeSeries' ? () => toggleChartSort(activeChart.id) : undefined}
                                    sortOrder={activeChart.id !== 'timeSeries' ? (chartSorts[activeChart.id] || 'asc') : undefined}
                                >
                                    {renderChart(activeChart)}
                                </SortableChartCard>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* --- MULTIPLE VIEW (GRID MODE WITH DRAG & DROP) --- */}
            {viewMode === 'grid' && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
                    <SortableContext items={activeCharts.map(c => c.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {llmChartData && (
                                <SortableChartCard
                                    chart={llmChartData}
                                    onToggleFloat={() => toggleFloatingWindow(llmChartData)}
                                    isFloating={floatingWindows.some(w => w.id === 'llmGenerated')}
                                    onSave={() => handleSaveChart('llmGenerated')}
                                >
                                    {renderChart(llmChartData)}
                                </SortableChartCard>
                            )}
                            {loadedSavedChart && (
                                <SortableChartCard
                                    chart={loadedSavedChart}
                                    onToggleFloat={() => toggleFloatingWindow(loadedSavedChart)}
                                    isFloating={floatingWindows.some(w => w.id === loadedSavedChart.id)}
                                    onSave={() => handleSaveChart(loadedSavedChart.id)}
                                >
                                    {renderChart(loadedSavedChart)}
                                </SortableChartCard>
                            )}
                            {activeCharts.map((chart) => (
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
                                    onToggleSort={chart.id !== 'timeSeries' ? () => toggleChartSort(chart.id) : undefined}
                                    sortOrder={chart.id !== 'timeSeries' ? (chartSorts[chart.id] || 'asc') : undefined}
                                >
                                    {renderChart(chart)}
                                </SortableChartCard>
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay dropAnimation={dropAnimationConfig}>
                        {activeId ? (
                            <SortableChartCard
                                chart={activeCharts.find(c => c.id === activeId)!}
                                displayType={activeCharts.find(c => c.id === activeId)?.type.includes('/') ? chartDisplay[activeId as keyof typeof chartDisplay] : undefined}
                                displayUnit={['employmentType', 'jobsByExperience'].includes(activeId) ? chartUnits[activeId as keyof typeof chartUnits] : undefined}
                            >
                                {renderChart(activeCharts.find(c => c.id === activeId)!)}
                            </SortableChartCard>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* --- FLOATING CHART POPOUTS --- */}
            {floatingWindows.map(chart => (
                <FloatingWindow key={`floating-${chart.id}`} chart={chart} index={0} onClose={() => toggleFloatingWindow(chart)}>
                    {renderChart(chart)}
                </FloatingWindow>
            ))}
        </div>
    );
}