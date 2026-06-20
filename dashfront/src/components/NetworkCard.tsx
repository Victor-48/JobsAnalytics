import React, { useState } from 'react';
import { NetworkGraphChart } from './NetworkGraphChart';
import { GraphLegend } from './GraphLegend';
import { DateRangePicker } from './DateRangePicker';
import { Button } from '@/components/ui/button';
import { X, Zap, BarChart2 } from 'lucide-react';
import { CoOccurrenceModal } from './CoOccurrenceModal';
import type { NodeObject, LinkObject } from 'force-graph';
import type { DateRange } from "react-day-picker";
import type { GraphData } from '@/api/jobApi';

interface NetworkCardProps {
    isMaximized?: boolean;
    onMaximizeToggle: () => void;
    data: GraphData | undefined;
    isLoading: boolean;
    dateRange: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
    isTrendMode: boolean;
    onTrendModeChange: (isTrend: boolean) => void;
    highlightedNode: NodeObject | null;
    onNodeClick: (node: NodeObject) => void;
    onBackgroundClick: () => void;
}

export function NetworkCard({
    isMaximized = false,
    onMaximizeToggle,
    data,
    isLoading,
    dateRange,
    onDateChange,
    isTrendMode,
    onTrendModeChange,
    highlightedNode,
    onNodeClick,
    onBackgroundClick
}: NetworkCardProps) {
    const [selectedLink, setSelectedLink] = useState<LinkObject | null>(null);

    return (
        <>
            <div className="w-full h-full bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    {/* Left side: Title and Date Controls */}
                    <div>
                        <Button 
                            variant="ghost" 
                            onClick={() => onTrendModeChange(!isTrendMode)} 
                            className="p-2 -ml-2 h-auto hover:bg-transparent"
                        >
                            <div className="flex items-center gap-2 text-primary">
                                <div className="relative w-5 h-5 flex items-center justify-center">
                                    <BarChart2 className={`absolute transition-all duration-300 ${isTrendMode ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} size={20} />
                                    <Zap className={`absolute transition-all duration-300 ${isTrendMode ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {isTrendMode ? 'Trend-Detection Mode' : 'Skill Co-occurrence Network'}
                                </h2>
                            </div>
                        </Button>
                        <div className="flex items-center gap-2 mt-2">
                            <DateRangePicker date={dateRange} onDateChange={onDateChange} />
                            {dateRange && (
                                <Button variant="ghost" size="icon" onClick={() => onDateChange(undefined)} title="Reset date range">
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right side: View Controls */}
                    <button onClick={onMaximizeToggle} className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground">
                        {isMaximized ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                        )}
                    </button>
                </div>

                <div className="min-h-[400px] flex-grow relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-card/50 backdrop-blur-sm flex items-center justify-center z-10">
                            <p>Loading graph...</p>
                        </div>
                    )}
                    {data && (
                        <NetworkGraphChart 
                            key={isMaximized ? 'maximized' : 'normal'}
                            data={data} 
                            highlightedNode={highlightedNode}
                            onNodeClick={onNodeClick}
                            onBackgroundClick={onBackgroundClick}
                            onLinkClick={setSelectedLink}
                            isTrendMode={isTrendMode}
                        />
                    )}
                </div>
                <GraphLegend isTrendMode={isTrendMode} />
            </div>
            
            {selectedLink && (
                <CoOccurrenceModal 
                    skill1={(selectedLink.source as NodeObject).id as string}
                    skill2={(selectedLink.target as NodeObject).id as string}
                    onClose={() => setSelectedLink(null)}
                />
            )}
        </>
    );
}