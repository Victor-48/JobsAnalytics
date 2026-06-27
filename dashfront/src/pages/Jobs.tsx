import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { JobPosting } from "../types/Job";
import { fetchJobs, searchJobs, fetchJobLocations } from "../api/jobApi";
import type { PageResponse } from "../api/jobApi";
import JobCard from "../components/JobCard";
import { getSectors, SectorDTO } from "../api/escoApi";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Search, MapPin, Briefcase, ChevronLeft, ChevronRight, Loader2, PlusCircle, Frown } from "lucide-react";
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
    const [remoteFilter, setRemoteFilter] = useState("all");
    const [industryFilter, setIndustryFilter] = useState("all");
    const [sectors, setSectors] = useState<SectorDTO[]>([]);
    
    const [countryFilter, setCountryFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [locations, setLocations] = useState<any[]>([]);

    useEffect(() => {
        getSectors(0, 100).then(res => setSectors(res.content || [])).catch(console.error);
        fetchJobLocations().then(res => setLocations(res || [])).catch(console.error);
    }, []);

    const loadData = async (pageToLoad: number) => {
        setIsLoading(true);
        try {
            let actualRemote = remoteFilter === "all" ? "" : remoteFilter;
            let actualIndustry = industryFilter === "all" ? "" : industryFilter;

            let actualCountry = countryFilter === "all" ? undefined : countryFilter;
            let actualCity = cityFilter === "all" ? undefined : cityFilter;

            let data: PageResponse<JobPosting>;
            if (!search.trim()) {
                data = await fetchJobs(actualRemote, actualIndustry, actualCountry, actualCity, pageToLoad, pageSize);
            } else {
                data = await searchJobs(search, pageToLoad, pageSize);
            }
            
            let filteredContent = data.content || [];
            if (search.trim() && (actualRemote || actualIndustry)) {
                 if (actualRemote) {
                    filteredContent = filteredContent.filter(job => job.remoteFlexibility === actualRemote);
                }
                if (actualIndustry) {
                    filteredContent = filteredContent.filter(job => job.sector?.name === actualIndustry || job.industry === actualIndustry);
                }
                if (actualCountry) {
                    filteredContent = filteredContent.filter(job => job.country === actualCountry);
                }
                if (actualCity) {
                    filteredContent = filteredContent.filter(job => job.city === actualCity);
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
            loadData(0);
        }, 300); 

        return () => clearTimeout(debounceTimer);
    }, [search, remoteFilter, industryFilter, countryFilter, cityFilter]);

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
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
                    <p className="text-muted-foreground mt-1">Explore {totalElements} available opportunities</p>
                </div>
                <Button asChild className="gap-2">
                    <Link to="/add-job">
                        <PlusCircle className="w-4 h-4" />
                        Post a Job
                    </Link>
                </Button>
            </div>

            {/* Search and Filters Card */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search jobs by title or keyword..."
                        className="pl-10 py-6 text-base"
                    />
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Remote Flexibility
                        </label>
                        <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Work Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Work Types</SelectItem>
                                <SelectItem value="Remote">Remote</SelectItem>
                                <SelectItem value="On-site">Onsite</SelectItem>
                                <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5" />
                            Economic Sector (NACE)
                        </label>
                        <Select value={industryFilter} onValueChange={setIndustryFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Sectors" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sectors</SelectItem>
                                {sectors.map((sector: any) => (
                                    <SelectItem key={sector.conceptUri || sector.uri || sector.name} value={sector.name}>
                                        {sector.name.length > 40 ? sector.name.substring(0, 40) + "..." : sector.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Country
                        </label>
                        <Select value={countryFilter} onValueChange={(val) => { setCountryFilter(val); setCityFilter("all"); }}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Countries" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {Array.from(new Set(locations.map(loc => loc.country).filter(Boolean))).sort().map((country) => (
                                    <SelectItem key={country} value={country}>
                                        {country}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            City
                        </label>
                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Cities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Cities</SelectItem>
                                {Array.from(new Set(
                                    locations
                                        .filter(loc => countryFilter === "all" || loc.country === countryFilter)
                                        .map(loc => loc.city)
                                        .filter(Boolean)
                                )).sort().map((city) => (
                                    <SelectItem key={city} value={city}>
                                        {city}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && jobs.length === 0 && (
                <div className="flex justify-center items-center py-20 min-h-[300px]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            )}

            {/* Job Cards Grid */}
            {!isLoading && jobs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border flex flex-col items-center justify-center min-h-[300px]">
                    <Frown className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground">No jobs found</h3>
                    <p className="text-muted-foreground mt-1 max-w-sm mx-auto">We couldn't find any jobs matching your current search or filters. Try adjusting them to see more results.</p>
                    <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setRemoteFilter("all"); setIndustryFilter("all"); setCountryFilter("all"); setCityFilter("all"); }}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {jobs.map((job, index) => (
                        <div 
                            key={job.id || `${job.title}-${job.company}-${index}`} 
                            onClick={() => window.location.href = `/jobs/${job.id}`}
                            className="block transition-transform hover:-translate-y-1 hover:shadow-lg rounded-xl cursor-pointer"
                        >
                            <JobCard job={job} />
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-border pt-6 pb-10">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0 || isLoading}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    
                    <div className="text-sm font-medium text-muted-foreground">
                        Page <span className="text-foreground">{currentPage + 1}</span> of <span className="text-foreground">{totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1 || isLoading}
                        className="gap-2"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}