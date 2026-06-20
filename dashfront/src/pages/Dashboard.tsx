import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchJobLocations, fetchSkillCoOccurrence, fetchSkillCoOccurrenceTrends } from "../api/jobApi";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { SavedInsights, type SavedChart } from "../components/SavedInsights";
import { useAuth } from "../contexts/AuthContext";
import { RoleSwitcher } from "../components/RoleSwitcher";
import MapChart, { type MapViewState } from "../components/MapChart";
import KeyIndicators from "../components/KeyIndicators";
import { NetworkCard } from "../components/NetworkCard";
import { Tutorial, type TutorialStep } from "../components/Tutorial";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import type { NodeObject } from 'force-graph';
import type { DateRange } from "react-day-picker";

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
    const [showTutorial, setShowTutorial] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'single'>('single');

    const tutorialSteps: TutorialStep[] = useMemo(() => {
        const baseSteps: TutorialStep[] = [
            {
                elementId: 'kpi-indicators',
                title: 'Key Performance Indicators',
                content: 'These cards show a high-level overview of the job market, including the total number of jobs and the fastest-growing skills.',
                position: 'bottom',
            },
            {
                elementId: 'ai-assistant-input',
                title: 'Ask Your Data (AI Assistant)',
                content: 'Use natural language to ask complex questions about the data. The AI will generate a custom chart to answer your query.',
                position: 'bottom',
            },
            {
                elementId: 'standard-analytics-charts',
                title: 'Standard Analytics',
                content: 'This section provides detailed, interactive charts on various market aspects. You can switch between a focused view and a grid view.',
                position: 'left',
            }
        ];

        if (viewMode === 'grid') {
            baseSteps.push(
                {
                    elementId: 'tutorial-drag-handle',
                    title: 'Reorder Charts',
                    content: 'Click and drag this handle to reorder the charts in the grid view to your preference.',
                    position: 'left',
                },
                {
                    elementId: 'tutorial-toggle-type',
                    title: 'Change Display Type',
                    content: 'For charts that support it, click this button to toggle between different visualizations, like a pie chart and a bar chart.',
                    position: 'left',
                },
                {
                    elementId: 'tutorial-popout-chart',
                    title: 'Pop-out Window',
                    content: 'Click here to open any chart in a separate, floating window for easy comparison.',
                    position: 'left',
                },
                {
                    elementId: 'tutorial-save-chart',
                    title: 'Save Insight',
                    content: 'Save any chart configuration, including AI-generated ones, to your personal collection.',
                    position: 'left',
                },
                {
                    elementId: 'sidebar-saved-insights',
                    title: 'Your Saved Insights',
                    content: 'All your saved charts and queries will appear here in the sidebar, organized by category for easy access later.',
                    position: 'right',
                }
            );
        } else {
             baseSteps.push({
                elementId: 'standard-analytics-charts',
                title: 'Interactive Features',
                content: 'Switch to "Grid View" to see interactive features like dragging to reorder, changing chart types, and saving insights.',
                position: 'left',
            });
        }

        baseSteps.push(
            {
                elementId: 'network-card',
                title: 'Skill Co-occurrence Network',
                content: 'This graph visualizes the relationships between skills. Click the title to switch to "Trend-Detection Mode" and see which skill connections are growing or fading.',
                position: 'left',
            },
            {
                elementId: 'map-card',
                title: 'Geospatial Distribution',
                content: 'This map shows where jobs are located. Clusters represent the total number of jobs in that area. Click to zoom in.',
                position: 'right',
            }
        );

        return baseSteps;
    }, [viewMode]);

    // Auto-start tutorial for new users
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const isNewUser = params.get('new_user') === 'true';
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');

        if (isNewUser && !hasSeenTutorial) {
            setViewMode('grid');
            setTimeout(() => setShowTutorial(true), 500);
            localStorage.setItem('hasSeenTutorial', 'true');
        }
    }, [location.search]);

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

    return (
        <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground relative">
            <RoleSwitcher />
            <button onClick={() => setShowSavedInsights(prev => !prev)} className={`absolute top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-card border-y border-r border-border rounded-r-lg flex items-center justify-center transition-all duration-300 hover:bg-secondary group ${showSavedInsights ? "left-72" : "left-0"}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-muted-foreground group-hover:text-foreground transition-transform ${showSavedInsights ? "" : "rotate-180"}`}><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <aside id="sidebar-saved-insights" className={`absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border overflow-y-auto z-20 transition-transform duration-300 hidden lg:block ${showSavedInsights ? "translate-x-0" : "-translate-x-full"}`}>
                <SavedInsights onLoadInsight={setLoadedSavedChart} />
            </aside>
            <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${showSavedInsights ? "lg:ml-72" : "ml-0"}`}>
                <div className="max-w-6xl mx-auto pb-20">
                    <div id="kpi-indicators"><KeyIndicators /></div>
                    <div id="standard-analytics-charts" className="w-full mb-8">
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
            <Button onClick={() => setShowTutorial(true)} variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 shadow-lg">
                <HelpCircle className="h-6 w-6" />
            </Button>
            {showTutorial && <Tutorial steps={tutorialSteps} onClose={() => setShowTutorial(false)} />}
        </div>
    );
}