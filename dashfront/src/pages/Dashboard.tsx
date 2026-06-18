import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJobLocations, fetchSkillCoOccurrence } from "../api/jobApi";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { SavedInsights, type SavedChart } from "../components/SavedInsights";
import { useAuth } from "../contexts/AuthContext";
import { RoleSwitcher } from "../components/RoleSwitcher";
import MapChart, { type MapViewState } from "../components/MapChart";
import KeyIndicators from "../components/KeyIndicators";
import { NetworkGraphChart } from "../components/NetworkGraphChart";
import type { NodeObject } from 'force-graph';

// --- MapCard Props ---
interface MapCardProps {
    isMaximized?: boolean;
    onMaximizeToggle: () => void;
    locationData: Record<string, number>;
    viewState: MapViewState;
    onViewChange: (state: MapViewState) => void;
    isActive: boolean;
    onActiveChange: (active: boolean) => void;
}

// --- MapCard Component ---
function MapCard({
                     isMaximized = false,
                     onMaximizeToggle,
                     locationData,
                     viewState,
                     onViewChange,
                     isActive,
                     onActiveChange
                 }: MapCardProps) {
    return (
        <div className="w-full h-full bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-foreground">
                    Geospatial Distribution
                </h2>

                <button
                    onClick={onMaximizeToggle}
                    className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
                >
                    {isMaximized ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                        </svg>
                    )}
                </button>
            </div>

            <div className="flex-grow min-h-[400px]">
                <MapChart
                    locationData={locationData}
                    viewState={viewState}
                    onViewChange={onViewChange}
                    isActive={isActive}
                    onActiveChange={onActiveChange}
                />
            </div>
        </div>
    );
}

// --- Dashboard ---
export default function Dashboard() {
    const { role } = useAuth();

    const [locations, setLocations] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);
    const [loadedSavedChart, setLoadedSavedChart] = useState<SavedChart | null>(null);
    const [showSavedInsights, setShowSavedInsights] = useState(true);

    const [isMapMaximized, setMapMaximized] = useState(false);
    const [mapViewState, setMapViewState] = useState<MapViewState>({
        center: [20, 0],
        zoom: 2
    });

    const [isMapActive, setMapActive] = useState(false);
    const [highlightedNode, setHighlightedNode] = useState<NodeObject | null>(null);

    const { data: coOccurrenceData, isLoading: isGraphLoading } = useQuery({
        queryKey: ["skillCoOccurrence"],
        queryFn: fetchSkillCoOccurrence,
    });

    useEffect(() => {
        fetchJobLocations()
            .then(data => {
                if (data) setLocations(data);
            })
            .catch(err => {
                console.error(err);
                setError("Could not load location data.");
            });
    }, []);

    if (error) {
        return <p className="text-destructive p-4">{error}</p>;
    }

    const handleLoadInsight = (chart: SavedChart) => {
        setLoadedSavedChart(chart);
    };

    const handleMaximizeToggle = () => {
        setMapMaximized(prev => !prev);
    };

    const mapCardProps = {
        isMaximized: isMapMaximized,
        onMaximizeToggle: handleMaximizeToggle,
        locationData: locations,
        viewState: mapViewState,
        onViewChange: setMapViewState,
        isActive: isMapActive,
        onActiveChange: setMapActive,
    };

    return (
        <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground relative">
            <RoleSwitcher />

            <button
                onClick={() => setShowSavedInsights(prev => !prev)}
                className={`absolute top-1/2 -translate-y-1/2 z-30 w-6 h-16 bg-card border-y border-r border-border rounded-r-lg flex items-center justify-center transition-all duration-300 hover:bg-secondary group ${
                    showSavedInsights ? "left-72" : "left-0"
                }`}
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`text-muted-foreground group-hover:text-foreground transition-transform ${
                        showSavedInsights ? "" : "rotate-180"
                    }`}
                >
                    <path d="m15 18-6-6 6-6" />
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border overflow-y-auto z-20 transition-transform duration-300 hidden lg:block ${
                    showSavedInsights ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <SavedInsights onLoadInsight={handleLoadInsight} />
            </aside>

            {/* Main */}
            <main
                className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${
                    showSavedInsights ? "lg:ml-72" : "ml-0"
                }`}
            >
                <div className="max-w-6xl mx-auto pb-20">

                    <KeyIndicators />

                    <div className="w-full mb-8">
                        <AnalyticsCharts initialLoadedChart={loadedSavedChart} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                        {/* Map */}
                        <MapCard {...mapCardProps} />

                        {/* Network */}
                        <div className="w-full bg-card p-6 rounded-2xl border border-border">
                            <h2 className="text-xl font-bold mb-4">
                                Skill Co-occurrence Network
                            </h2>

                            <div className="min-h-[400px]">
                                {isGraphLoading ? (
                                    <p>Loading graph...</p>
                                ) : (
                                    coOccurrenceData && (
                                        <NetworkGraphChart 
                                            data={coOccurrenceData} 
                                            highlightedNode={highlightedNode}
                                            onNodeClick={setHighlightedNode}
                                            onBackgroundClick={() => setHighlightedNode(null)}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fullscreen Map */}
            {isMapMaximized && (
                <>
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                        onClick={() => setMapMaximized(false)}
                    />

                    <div className="fixed inset-4 md:inset-8 z-50">
                        <MapCard {...mapCardProps} isMaximized={true} />
                    </div>
                </>
            )}
        </div>
    );
}