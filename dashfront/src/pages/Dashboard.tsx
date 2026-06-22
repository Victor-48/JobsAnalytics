import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchJobLocations, fetchSkillCoOccurrence, fetchSkillCoOccurrenceTrends } from "../api/jobApi";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { SavedInsights, type SavedChart } from "../components/SavedInsights";
import { useAuth } from "../contexts/AuthContext";
import { useTutorial } from "../contexts/TutorialContext";
import MapChart, { type MapViewState } from "../components/MapChart";
import KeyIndicators from "../components/KeyIndicators";
import { NetworkCard } from "../components/NetworkCard";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import type { NodeObject } from 'force-graph';
import type { DateRange } from "react-day-picker";
import type { Step } from 'react-joyride';

// --- MapCard Component ---
function MapCard({ isMaximized = false, onMaximizeToggle, locationData, viewState, onViewChange, isActive, onActiveChange }: any) {
    return (
        <div id="map-card" className="w-full h-full bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">Geospatial Distribution</h2>
                <button onClick={onMaximizeToggle} className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground">
                    {isMaximized ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                    )}
                </button>
            </div>
            <div className="flex-grow min-h-[400px]">
                <MapChart locationData={locationData} viewState={viewState} onViewChange={onViewChange} isActive={isActive} onActiveChange={onActiveChange} />
            </div>
        </div>
    );
}

// --- Dashboard ---
export default function Dashboard() {
    const location = useLocation();
    const navigate = useNavigate();
    const { startTutorial } = useTutorial();
    const { role } = useAuth();
    const [locations, setLocations] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [loadedSavedChart, setLoadedSavedChart] = useState<SavedChart | null>(null);
    const [showSavedInsights, setShowSavedInsights] = useState(true);
    const [isMapMaximized, setMapMaximized] = useState(false);
    const [isNetworkMaximized, setNetworkMaximized] = useState(false);
    const [mapViewState, setMapViewState] = useState<MapViewState>({ center: [20, 0], zoom: 2 });
    const [isMapActive, setMapActive] = useState(false);
    const [highlightedNode, setHighlightedNode] = useState<NodeObject | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isTrendMode, setTrendMode] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');

    const tutorialSteps: Step[] = useMemo(() => [
        {
            target: '#kpi-indicators',
            content: 'These cards show a high-level overview of the job market, including the total number of jobs and the fastest-growing skills.',
            placement: 'bottom',
        },
        {
            target: '#ai-assistant-input',
            content: 'Use natural language to ask complex questions about the data. The AI will generate a custom chart to answer your query.',
            placement: 'bottom',
        },
        {
            target: '#standard-analytics-charts',
            content: 'This section provides detailed, interactive charts on various market aspects. You can switch between a focused view and a grid view.',
            placement: 'left',
        },
        {
            target: '#standard-analytics-buttons',
            content: 'Click these buttons to switch between different insights, like Salary comparisons or Postings over time. The interactive chart below will update automatically.',
            placement: 'left',
        },
        {
            target: '#tutorial-popout-chart',
            content: 'Need a closer look? Click this button to pop the chart out into a larger, floating window.',
            placement: 'bottom',
        },
        {
            target: '#tutorial-drag-handle',
            content: 'If you switch to Grid View, you can click and hold this handle to drag and reorganize the order of your charts.',
            placement: 'bottom',
        },
        {
            target: '#tutorial-save-chart',
            content: 'Click this Save icon to bookmark this specific insight. It will be stored in your Saved Insights sidebar for quick access later.',
            placement: 'bottom',
        },
        {
            target: '#sidebar-toggle-btn',
            content: showSavedInsights
                ? 'This is the button that toggles the Saved Insights sidebar. Click Next to continue.'
                : 'Click this button to open the Saved Insights sidebar.',
            placement: 'right',
            spotlightClicks: true,

            styles: {
                buttonNext: !showSavedInsights ? {
                    backgroundColor: 'hsl(var(--muted))',
                    color: 'hsl(var(--muted-foreground))',
                    cursor: 'not-allowed',
                    pointerEvents: 'none',
                } : undefined
            } as any
        },
        {
            target: '#saved-insights-sidebar',
            content: 'Any charts you save using the Save icon will appear here. You can load them back up anytime to review your custom insights.',
            placement: 'right',
        },
        {
            target: '#network-card',
            content: 'This graph visualizes the relationships between skills. Click the title to switch to "Trend-Detection Mode" and see which skill connections are growing or fading.',
            placement: 'left',
        },
        {
            target: '#map-card',
            content: 'This map shows where jobs are located. Clusters represent the total number of jobs in that area. Click to zoom in.',
            placement: 'right',
        },
        {
            target: '#jobs-page-link',
            content: 'Now, let\'s explore the jobs table to see the raw data.',
            placement: 'bottom',
        },
    ], [viewMode, showSavedInsights]);

    const handleTutorialStart = () => {
        const firstStepTarget = document.querySelector(tutorialSteps[0].target as string);

        if (firstStepTarget) {
            firstStepTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => {
            startTutorial(tutorialSteps);
        }, 300);
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('tutorial') === 'true') {
            navigate(location.pathname, { replace: true }); // Clean URL
            handleTutorialStart();
        }
    }, [location, navigate, startTutorial]);

    const { data: coOccurrenceData, isFetching: isGraphFetching } = useQuery({
        queryKey: ["skillCoOccurrence", dateRange, isTrendMode],
        queryFn: () => {
            if (isTrendMode) {
                return fetchSkillCoOccurrenceTrends(dateRange?.to?.toISOString().split('T')[0]);
            }
            return fetchSkillCoOccurrence(
                dateRange?.from?.toISOString().split('T')[0],
                dateRange?.to?.toISOString().split('T')[0]
            );
        },
    });

    useEffect(() => {
        fetchJobLocations()
            .then(data => { if (data) setLocations(data); })
            .catch(err => { console.error(err); setError("Could not load location data."); });
    }, []);

    if (error) { return <p className="text-destructive p-4">{error}</p>; }

    const mapCardProps = {
        isMaximized: isMapMaximized,
        onMaximizeToggle: () => setMapMaximized(prev => !prev),
        locationData: locations,
        viewState: mapViewState,
        onViewChange: setMapViewState,
        isActive: isMapActive,
        onActiveChange: setMapActive,
    };

    const networkCardProps = {
        isMaximized: isNetworkMaximized,
        onMaximizeToggle: () => setNetworkMaximized(prev => !prev),
        data: coOccurrenceData,
        isLoading: isGraphFetching,
        dateRange: dateRange,
        onDateChange: setDateRange,
        isTrendMode: isTrendMode,
        onTrendModeChange: setTrendMode,
        highlightedNode: highlightedNode,
        onNodeClick: setHighlightedNode,
        onBackgroundClick: () => setHighlightedNode(null),
    };

    const handleSidebarToggle = () => {
        setShowSavedInsights(prev => !prev);
    };

    return (
        <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground relative">
            <button
                id="sidebar-toggle-btn"
                onClick={handleSidebarToggle}
                className={`absolute top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-card border-y border-r border-border rounded-r-lg flex items-center justify-center transition-all duration-300 hover:bg-secondary group ${showSavedInsights ? "left-72" : "left-0"}`}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground group-hover:text-foreground transition-transform ${showSavedInsights ? "" : "rotate-180"}`}><path d="m15 18-6-6 6-6" /></svg>
            </button>

            <aside id="saved-insights-sidebar" className={`absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border overflow-y-auto z-20 transition-transform duration-300 hidden lg:block ${showSavedInsights ? "translate-x-0" : "-translate-x-full"}`}>
                <SavedInsights onLoadInsight={setLoadedSavedChart} />
            </aside>

            <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${showSavedInsights ? "lg:ml-72" : "ml-0"}`}>
                <div className="max-w-6xl mx-auto pb-20">
                    <div id="kpi-indicators"><KeyIndicators /></div>
                    <div className="w-full mb-8">
                        <AnalyticsCharts
                            initialLoadedChart={loadedSavedChart}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <MapCard {...mapCardProps} />
                        <div id="network-card"><NetworkCard {...networkCardProps} /></div>
                    </div>
                </div>
            </main>
            {(isMapMaximized || isNetworkMaximized) && (
                <>
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => { setMapMaximized(false); setNetworkMaximized(false); }} />
                    <div className="fixed inset-4 md:inset-8 z-50">
                        {isMapMaximized && <MapCard {...mapCardProps} isMaximized={true} />}
                        {isNetworkMaximized && <NetworkCard {...networkCardProps} isMaximized={true} />}
                    </div>
                </>
            )}
            <Button onClick={handleTutorialStart} variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg">
                <HelpCircle className="h-6 w-6" />
            </Button>
        </div>
    );
}