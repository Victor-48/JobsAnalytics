import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { JobPosting } from "../types/Job";
import { fetchJobs, searchJobs } from "../api/jobApi";
import type { PageResponse } from "../api/jobApi";
import JobCard from "../components/JobCard";
import { NACE_SECTORS } from "./AddJob";
import "../styles/Jobs.css";

export default function Jobs() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Filter states
    const [remoteFilter, setRemoteFilter] = useState("");
    const [industryFilter, setIndustryFilter] = useState("");

    const loadData = async (pageToLoad: number) => {
        setIsLoading(true);
        try {
            let data: PageResponse<JobPosting>;
            if (!search.trim()) {
                data = await fetchJobs(remoteFilter, industryFilter, pageToLoad, pageSize);
            } else {
                data = await searchJobs(search, pageToLoad, pageSize);
            }
            
            let filteredContent = data.content || [];
            if (search.trim() && (remoteFilter || industryFilter)) {
                 if (remoteFilter) {
                    filteredContent = filteredContent.filter(job => job.remoteFlexibility === remoteFilter);
                }
                if (industryFilter) {
                    // Fix: Check industry or naceCode depending on what's populated
                    filteredContent = filteredContent.filter(job => job.naceCode === industryFilter || job.industry === industryFilter);
                }
                setJobs(filteredContent);
            } else {
                setJobs(filteredContent);
            }
            
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
            setCurrentPage(data.pageable?.pageNumber || 0);
            
        } catch (error) {
            console.error("Failed to load jobs", error);
            setJobs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setCurrentPage(0);
            loadData(0); // This promise is intentionally ignored as it's safe to float in an effect
        }, 300); 

        return () => clearTimeout(debounceTimer);
    }, [search, remoteFilter, industryFilter]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setCurrentPage(0);
            loadData(0);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            loadData(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Job Postings</h1>
                    <p className="text-muted-foreground mt-1">Found {totalElements} opportunities</p>
                </div>
                <Link 
                    to="/add-job" 
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg hover:opacity-90 transition font-medium shadow-sm flex items-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Post a Job
                </Link>
            </div>

            {/* Search and Filters Card */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-8 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search jobs by title or keyword..."
                        className="w-full pl-12 pr-4 py-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-ring focus:border-ring transition-all outline-none text-foreground"
                    />
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Remote Flexibility</label>
                        <select
                            value={remoteFilter}
                            onChange={(e) => setRemoteFilter(e.target.value)}
                            className="w-full bg-background border border-input text-foreground rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                        >
                            <option value="">All Work Types</option>
                            <option value="Remote">Remote</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-xs text-muted-foreground mb-1.5 font-semibold uppercase tracking-wider">Economic Sector (NACE)</label>
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="w-full bg-background border border-input text-foreground rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                        >
                            <option value="">All Sectors</option>
                            {NACE_SECTORS.map((sector: any) => (
                                <option key={sector.code} value={sector.code} title={sector.description}>
                                    {sector.description.length > 40 ? sector.description.substring(0, 40) + "..." : sector.description}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && jobs.length === 0 && (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Job Cards Grid */}
            {!isLoading && jobs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                    <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <h3 className="text-lg font-medium text-foreground">No jobs found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job, index) => (
                        <JobCard key={job.id || `${job.title}-${job.company}-${index}`} job={job} />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-input rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Previous
                    </button>
                    
                    <div className="text-sm text-muted-foreground font-medium">
                        Page <span className="text-foreground">{currentPage + 1}</span> of <span className="text-foreground">{totalPages}</span>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-input rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
            )}
        </div>
    );
}