import React, { useEffect, useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface SavedChart {
    id: string;
    title: string;
    chartType: string; // 'bar', 'pie', 'line'
    data: any;
    timestamp: number;
    category: string; // 'skills', 'salary', 'jobs', 'custom'
    query?: string; // Optional original query if from LLM
    displayType?: string; // current display variant, e.g. pie/bar
    displayUnit?: string; // absolute/percentage
}

interface Props {
    onLoadInsight: (chart: SavedChart) => void;
}

export function SavedInsights({ onLoadInsight }: Props) {
    const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
    
    // Auto-update when localStorage changes
    useEffect(() => {
        const loadSaved = () => {
            const saved = localStorage.getItem('savedInsights');
            if (saved) {
                try {
                    setSavedCharts(JSON.parse(saved));
                } catch (e) {
                    console.error('Error parsing saved insights', e);
                }
            }
        };

        loadSaved();
        
        // Listen for custom event triggered when a new chart is saved
        window.addEventListener('insightsUpdated', loadSaved);
        return () => window.removeEventListener('insightsUpdated', loadSaved);
    }, []);

    const deleteInsight = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = savedCharts.filter(c => c.id !== id);
        setSavedCharts(updated);
        localStorage.setItem('savedInsights', JSON.stringify(updated));
        window.dispatchEvent(new Event('insightsUpdated'));
    };

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };

    // Filter by search query and group by category
    const filteredCharts = savedCharts.filter(chart => 
        chart.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (chart.query && chart.query.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const groupedCharts = filteredCharts.reduce((acc, chart) => {
        if (!acc[chart.category]) acc[chart.category] = [];
        acc[chart.category].push(chart);
        return acc;
    }, {} as Record<string, SavedChart[]>);

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                </div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Saved Insights</h2>
            </div>
            
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    type="text" 
                    placeholder="Search insights..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-background/50 text-sm rounded-xl"
                />
            </div>
            
            {savedCharts.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-10 px-2">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/></svg>
                    No insights saved yet. Click the save icon on any chart to save it here.
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedCharts).map(([category, charts]) => (
                        <div key={category}>
                            <div 
                                className="flex items-center justify-between cursor-pointer mb-3 group"
                                onClick={() => toggleCategory(category)}
                            >
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2 group-hover:text-foreground transition-colors">
                                    {category}
                                    <span className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{charts.length}</span>
                                </h3>
                                <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                                    {collapsedCategories[category] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                </div>
                            </div>
                            
                            {!collapsedCategories[category] && (
                                <div className="space-y-2 mb-6">
                                {charts.sort((a, b) => b.timestamp - a.timestamp).map(chart => (
                                    <div 
                                        key={chart.id} 
                                        onClick={() => onLoadInsight(chart)}
                                        className="bg-background border border-border p-3 rounded-xl cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-medium text-foreground leading-tight line-clamp-2 pr-4">{chart.title}</h4>
                                            <button 
                                                onClick={(e) => deleteInsight(chart.id, e)}
                                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Insight"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                            </button>
                                        </div>
                                        {chart.query && (
                                             <div className="mt-1.5 text-xs text-muted-foreground italic line-clamp-1">
                                                 "{chart.query}"
                                             </div>
                                        )}
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded capitalize">
                                                {chart.chartType} {chart.displayUnit === 'percentage' ? '(%)' : ''}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(chart.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}