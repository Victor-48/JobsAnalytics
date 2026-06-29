import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Building, Clock, CalendarDays, ExternalLink, Loader2, Frown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import api from "../api/axiosconfig";
import type { JobPosting } from "../types/Job";

// Fix for leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function JobDetails() {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isMapMaximized, setMapMaximized] = useState(false);

    useEffect(() => {
        const loadJob = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/jobs/${id}`);
                setJob(response.data);
            } catch (err) {
                console.error("Failed to load job details", err);
                setError("Failed to load job details. The job might have been removed.");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) {
            loadJob();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-4xl mx-auto p-6 md:p-10 text-center flex flex-col items-center justify-center min-h-[50vh]">
                <Frown className="w-16 h-16 text-muted-foreground mb-6 opacity-50" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h2>
                <p className="text-muted-foreground mb-8 max-w-md">{error || "We couldn't find the job you're looking for."}</p>
                <Button asChild>
                    <Link to="/jobs">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Link>
                </Button>
            </div>
        );
    }

    const hasLocation = job.latitude !== undefined && job.longitude !== undefined;
    const formatSalary = (amount?: number, currency?: string) => {
        if (!amount) return "Not specified";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Back Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link to="/jobs" className="flex items-center gap-2 text-muted-foreground">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Jobs
                    </Link>
                </Button>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Job Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-400" />
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">{job.title}</h1>
                                    <div className="flex items-center text-muted-foreground gap-2 text-lg">
                                        <Building className="w-5 h-5 text-primary/80" />
                                        <span className="font-medium text-foreground/80">{job.company}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {job.remoteFlexibility && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                                            {job.remoteFlexibility}
                                        </Badge>
                                    )}
                                    {job.employmentType && (
                                        <Badge variant="outline" className="px-3 py-1 bg-background">
                                            {job.employmentType}
                                        </Badge>
                                    )}
                                    {job.experienceLevel && (
                                        <Badge variant="outline" className="px-3 py-1 bg-background">
                                            {job.experienceLevel} Level
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Button className="shrink-0 gap-2 font-semibold shadow-md" size="lg">
                                Apply Now
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
                        <h2 className="text-xl font-bold border-b border-border pb-4">Job Description</h2>
                        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {job.description || "No description provided for this position."}
                        </div>
                    </div>

                    {/* Required Skills Section */}
                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm space-y-6">
                            <h2 className="text-xl font-bold border-b border-border pb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {job.requiredSkills.map(skill => (
                                    <Badge key={skill.uri} variant="secondary" className="px-3 py-1.5 text-sm hover:bg-primary/20 cursor-default transition-colors">
                                        {skill.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-8">
                    {/* Quick Facts Card */}
                    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                        <h3 className="font-bold text-lg mb-4">Job Overview</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <DollarSign className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-0.5">Salary</p>
                                    <p className="font-semibold">{formatSalary(job.salary, job.currency)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-0.5">Location</p>
                                    <p className="font-semibold">{job.city && job.country ? `${job.city}, ${job.country}` : job.location}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-0.5">Industry</p>
                                    <p className="font-semibold line-clamp-2">{job.sector?.name || "Not specified"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                    <CalendarDays className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium mb-0.5">Posted On</p>
                                    <p className="font-semibold">{job.postedDate ? new Date(job.postedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently"}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Card */}
                    <div className={`bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col ${isMapMaximized ? 'fixed inset-4 md:inset-8 z-50 shadow-2xl h-auto' : 'h-[350px]'}`}>
                        <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Exact Location
                            </h3>
                            {hasLocation && (
                                <button 
                                    onClick={() => setMapMaximized(!isMapMaximized)} 
                                    className="p-1.5 hover:bg-muted-foreground/10 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isMapMaximized ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="flex-1 relative bg-muted flex items-center justify-center z-0">
                            {hasLocation ? (
                                <MapContainer 
                                    center={[job.latitude!, job.longitude!]} 
                                    zoom={13} 
                                    style={{ height: "100%", width: "100%", zIndex: 10 }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                                    />
                                    <Marker position={[job.latitude!, job.longitude!]}>
                                        <Popup>
                                            <div className="font-semibold">{job.company}</div>
                                            <div className="text-sm text-muted-foreground">{job.city}, {job.country}</div>
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <div className="text-center p-6 flex flex-col items-center">
                                    <MapPin className="w-10 h-10 text-muted-foreground opacity-30 mb-3" />
                                    <p className="text-sm text-muted-foreground">Map data is unavailable for this location.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Map Overlay Backdrop */}
            {isMapMaximized && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
                    onClick={() => setMapMaximized(false)} 
                />
            )}
        </div>
    );
}
