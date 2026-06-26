import React from "react";
import { Link } from "react-router-dom";
import type { JobPosting } from "../types/Job";
import "../styles/JobCard.css";

interface Props {
    job: JobPosting;
}

export default function JobCard({ job }: Props) {
    return (
        <div className="border border-border rounded-lg shadow-sm p-4 hover:shadow-md transition bg-card text-card-foreground flex flex-col justify-between h-full relative">
            {job.id && (
                <div className="absolute top-4 right-4">
                    <Link 
                        to={`/edit-job/${job.id}`} 
                        className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded transition"
                    >
                        Edit
                    </Link>
                </div>
            )}
            
            <div>
                <h3 className="font-bold text-lg text-primary pr-12">{job.title}</h3>
                <p className="text-foreground font-medium text-sm mb-2">{job.company}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                    {job.remoteFlexibility && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                            {job.remoteFlexibility}
                        </span>
                    )}
                    {job.sector && (
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-semibold">
                            {job.sector.name}
                        </span>
                    )}
                    {job.employmentType && (
                        <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full font-semibold">
                            {job.employmentType}
                        </span>
                    )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1 mb-4">
                    <p><strong className="text-foreground">Location:</strong> {job.location}</p>
                    {job.salary && (
                        <p><strong className="text-foreground">Salary:</strong> {job.salary} {job.currency || 'USD'}</p>
                    )}
                    {job.experienceLevel && (
                        <p><strong className="text-foreground">Experience:</strong> {job.experienceLevel}</p>
                    )}
                </div>
            </div>

            <div>
                <div className="mb-2">
                    <strong className="text-xs text-muted-foreground uppercase tracking-wider">Required Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {job.requiredSkills && job.requiredSkills.length > 0 ? (
                            job.requiredSkills.map(skill => (
                                <span key={skill.uri} className="px-2 py-1 bg-background text-muted-foreground text-xs rounded border border-border">
                                    {skill.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground/50">None specified</span>
                        )}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-2">
                    Posted: {job.postedDate ? (job.postedDate.includes('T') ? new Date(job.postedDate) : new Date(job.postedDate + "T00:00:00")).toLocaleDateString() : 'Unknown'}
                </p>
            </div>
        </div>
    );
}