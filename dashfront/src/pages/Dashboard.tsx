import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTopLanguages } from "../api/jobApi";
import type { ProgrammingLanguage } from "../types/Language";
import LanguageCard from "../components/LanguageCard";
import LanguageChart from "../components/LanguageChart";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function Dashboard() {
    const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
    const [error, setError] = useState<string | null>(null);

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

    if (error) return <p className="text-destructive p-4">{error}</p>;

    return (
        <div className="flex w-full h-[calc(100vh-73px)] overflow-hidden bg-background text-foreground transition-colors">
            
            {/* Left Sidebar - Predefined Statistics */}
            <aside className="w-72 flex-shrink-0 bg-card border-r border-border overflow-y-auto hidden lg:block shadow-[1px_0_15px_-5px_rgba(0,0,0,0.05)] z-10">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                        </div>
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Top Skills</h2>
                    </div>
                    
                    <div className="space-y-6">
                        {languages.length > 0 ? (
                            <div>
                                <div className="mb-6 bg-background rounded-xl p-2 border border-border shadow-inner">
                                    <LanguageChart languages={languages} />
                                </div>
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Leading Technologies</h3>
                                <div className="space-y-3">
                                    {languages.slice(0, 4).map((lang, index) => (
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 relative">
                <div className="max-w-6xl mx-auto pb-20">
                    {/* Header Area */}
                    <div className="flex justify-between items-end mb-8 bg-card p-6 rounded-2xl shadow-sm border border-border">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Analytics Center</h1>
                            <p className="text-muted-foreground text-sm max-w-lg">Explore job market trends, analyze salary distributions, and discover the most sought-after skills in the industry.</p>
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
                        <AnalyticsCharts />
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