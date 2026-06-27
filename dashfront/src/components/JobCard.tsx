import React from "react";
import { Link } from "react-router-dom";
import type { JobPosting } from "../types/Job";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";

interface Props {
    job: JobPosting;
}

export default function JobCard({ job }: Props) {
    return (
        <Card className="flex flex-col h-full relative group hover:shadow-md transition-all duration-300 border-border">
            {job.id && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                        to={`/edit-job/${job.id}`} 
                        className="text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-md transition-colors shadow-sm"
                    >
                        Edit
                    </Link>
                </div>
            )}
            
            <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="font-bold text-lg text-primary pr-14 leading-tight">{job.title}</CardTitle>
                <p className="text-foreground font-medium text-sm mt-1">{job.company}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                    {job.remoteFlexibility && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            {job.remoteFlexibility}
                        </Badge>
                    )}
                    {job.sector && (
                        <Badge variant="secondary">
                            {job.sector.name}
                        </Badge>
                    )}
                    {job.employmentType && (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                            {job.employmentType}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-4 flex-grow space-y-4">
                <div className="text-sm text-muted-foreground space-y-1.5">
                    <p className="flex gap-2"><strong className="text-foreground font-medium">Location:</strong> <span>{job.location}</span></p>
                    {job.salary && (
                        <p className="flex gap-2"><strong className="text-foreground font-medium">Salary:</strong> <span>{job.salary} {job.currency || 'USD'}</span></p>
                    )}
                    {job.experienceLevel && (
                        <p className="flex gap-2"><strong className="text-foreground font-medium">Experience:</strong> <span>{job.experienceLevel}</span></p>
                    )}
                </div>

                <div>
                    <strong className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Required Skills</strong>
                    <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills && job.requiredSkills.length > 0 ? (
                            job.requiredSkills.map(skill => (
                                <Badge key={skill.uri} variant="outline" className="text-muted-foreground font-normal">
                                    {skill.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground/50 italic">None specified</span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-4 border-t border-border/50 bg-muted/20">
                <p className="text-xs text-muted-foreground">
                    Posted: {job.postedDate ? (job.postedDate.includes('T') ? new Date(job.postedDate) : new Date(job.postedDate + "T00:00:00")).toLocaleDateString() : 'Unknown'}
                </p>
            </CardFooter>
        </Card>
    );
}