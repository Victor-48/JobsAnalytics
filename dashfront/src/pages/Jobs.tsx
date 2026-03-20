import React, { useEffect, useState } from "react";
import type { JobPosting } from "../types/Job.ts";
import { fetchJobs, searchJobs } from "../api/jobApi.ts";
import JobCard from "../components/JobCard";
import "../styles/Jobs.css";

export default function Jobs() {
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchJobs().then(setJobs);
    }, []);

    const handleSearch = async () => {
        if (!search.trim()) return fetchJobs().then(setJobs);
        const results = await searchJobs(search);
        setJobs(results);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Job Postings</h1>
            <div className="flex gap-2 mb-6">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search jobs..."
                    className="border rounded p-2 flex-1"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Search
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                    <JobCard key={job.title + job.company} job={job} />
                ))}
            </div>
        </div>
    );
}
