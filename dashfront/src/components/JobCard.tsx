import React from "react";
import type { JobPosting } from "../types/Job.ts";
import "../styles/JobCard.css";

interface Props {
    job: JobPosting;
}

export default function JobCard({ job }: Props) {
    return (
        <div className="border rounded-lg shadow p-4 hover:shadow-lg transition">
            <h3 className="font-bold text-lg">{job.title}</h3>
            <p>Company: {job.company}</p>
            <p>Location: {job.location}</p>
            <p>Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
            <p>Languages: {job.requiredLanguages.join(", ")}</p>
        </div>
    );
}
