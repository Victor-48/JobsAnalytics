import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTopLanguages } from "../api/jobApi";
import type { ProgrammingLanguage } from "../types/Language";
import LanguageCard from "../components/LanguageCard";
import LanguageChart from "../components/LanguageChart";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { SavedInsights } from "../components/SavedInsights";
import type { SavedChart } from "../components/SavedInsights";
import { useAuth } from "../contexts/AuthContext";
import { RoleSwitcher } from "../components/RoleSwitcher";

export default function Dashboard() {
    const { role } = useAuth();
    const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loadedSavedChart, setLoadedSavedChart] = useState<SavedChart | null>(null);

    useEffect(() => {
        fetchTopLanguages()
            .then(data => {
                if (Array.isArray(data)) {
                    // Filter out duplicate languages by name and ensure they have a valid name
                    const uniqueLangs = Array.from(new Map(data.filter(l => l && l.name).map(l => [l.name, l])).values());
                    setLanguages(uniqueLangs);
                } else {
                    setLanguages([]);
                }
            })
            .catch(() => setError("Could not load language data."));
    }, []);

    const handleLoadInsight = (chart: SavedChart) => {
        // We set the loaded chart, which will be passed down to AnalyticsCharts
        setLoadedSavedChart(chart);
    };

    if (error) return <p className="text-destructive p-4">{error}</p>;

    // 1. Admin View (Mock representation of DB Health)
    if (role === 'ADMIN') {
        return (
            <div className="flex flex-col w-full min-h-[calc(100vh-73px)] bg-background text-foreground transition-colors p-6 md:p-8">
                <RoleSwitcher />
                <div className="max-w-6xl mx-auto w-full">
                    <div className="mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Platform Admin</h1>
                        <p className="text-muted-foreground text-sm">Database health and platform metrics.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Jobs</h3>
                            <p className="text-4xl font-bold text-foreground">1,248</p>
                            <p className="text-xs text-emerald-500 mt-2 font-medium">+12% this week</p>
                        </div>
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Users</h3>
                            <p className="text-4xl font-bold text-foreground">8,592</p>
                            <p className="text-xs text-emerald-500 mt-2 font-medium">+5% this week</p>
                        </div>
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Known Skills</h3>
                            <p className="text-4xl font-bold text-foreground">342</p>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Mapped to taxonomy</p>
                        </div>
                        <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl shadow-sm">
                            <h3 className="text-sm font-medium text-destructive uppercase tracking-wider mb-2">Orphan Nodes</h3>
                            <p className="text-4xl font-bold text-destructive">14</p>
                            <p className="text-xs text-destructive/80 mt-2 font-medium">Requires cleanup</p>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                        <p className="mb-4">Graph Visualization & System Flow Charts would go here.</p>
                        <p className="text-sm">Includes features like `NetworkGraphChart` and complex database queries.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Guest View (Public Showcase)
    if (role === 'GUEST') {
        return (
            <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground transition-colors">
                <RoleSwitcher />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 relative custom-scrollbar">
                    <div className="max-w-4xl mx-auto pb-20">
                        <div className="text-center mb-12 mt-10">
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-4">Discover Job Market Trends</h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">Get a glimpse into the current state of the industry. Sign in to access full interactive analytics and AI tools.</p>
                            <Link to="/register" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium shadow-md hover:opacity-90 transition-opacity">
                                Create Free Account
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                                <h2 className="text-lg font-bold mb-4">Top Required Skills</h2>
                                {languages.length > 0 ? (
                                    <div className="flex justify-center w-full h-64">
                                         <LanguageChart languages={languages.slice(0, 5)} />
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <p className="text-sm text-muted-foreground">No language data found.</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center text-center">
                                <svg className="w-16 h-16 text-muted-foreground mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                <h3 className="font-bold text-lg mb-2">Interactive Maps</h3>
                                <p className="text-muted-foreground text-sm">Visualize job density and salary distributions across different regions.</p>
                                <span className="mt-4 text-xs font-semibold bg-secondary text-secondary-foreground px-3 py-1 rounded-full">Sign in to view</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // 3. User View (Authenticated - Full access to Analytics)
    return (
        <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground transition-colors">
            <RoleSwitcher />
            {/* Left Sidebar - Saved Insights Library */}
            <aside className="w-72 flex-shrink-0 bg-card border-r border-border overflow-y-auto hidden lg:block shadow-[1px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 custom-scrollbar">
                <SavedInsights onLoadInsight={handleLoadInsight} />
                
                <div className="p-6 border-t border-border/50 mt-4">
                     <div className="flex items-center gap-3 mb-6 pb-2">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Top Global Skills</h2>
                    </div>
                    <div className="space-y-6">
                        {languages.length > 0 ? (
                            <div>
                                <div className="mb-6 bg-background rounded-xl p-2 border border-border shadow-inner">
                                    <LanguageChart languages={languages} />
                                </div>
                                <div className="space-y-3">
                                    {languages.slice(0, 3).map((lang, index) => (
                                        <LanguageCard key={lang.name || index} language={lang} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-sm">Loading skills...</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Central Content - AI Search & Dashboard */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 relative custom-scrollbar">
                <div className="max-w-6xl mx-auto pb-20">
                    {/* Header Area */}
                    <div className="flex justify-between items-end mb-8 bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Analytics Center</h1>
                            <p className="text-muted-foreground text-sm max-w-lg">Explore job market trends, query with AI, and save custom insights to your library.</p>
                        </div>
                        <div className="hidden sm:block">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                Live Data
                            </div>
                        </div>
                    </div>

                    {/* Analytics Charts Component (Contains the Ask AI box and grid) */}
                    <div className="w-full">
                        <AnalyticsCharts initialLoadedChart={loadedSavedChart} />
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Tools Menu */}
            <aside className="w-20 flex-shrink-0 bg-card border-l border-border flex flex-col items-center py-8 gap-6 hidden md:flex shadow-[-1px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest rotate-180 mb-4" style={{ writingMode: 'vertical-rl' }}>
                    Quick Tools
                </div>
                
                <Link to="/add-job" className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 hover:scale-105 transition-all shadow-md group relative" title="Add New Job">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </Link>

                <div className="w-10 h-[1px] bg-border my-1"></div>

                <Link to="/jobs" className="w-12 h-12 rounded-xl bg-background border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-all hover:scale-105 group relative" title="Manage Jobs">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground transition-colors"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                </Link>

                <button className="w-12 h-12 rounded-xl bg-background border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-all hover:scale-105 group relative" title="Export Report">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                </button>
                
                <button className="w-12 h-12 rounded-xl bg-background border border-border text-foreground flex items-center justify-center hover:bg-secondary transition-all hover:scale-105 group relative mt-auto" title="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground group-hover:text-foreground transition-colors"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
            </aside>

        </div>
    );
}