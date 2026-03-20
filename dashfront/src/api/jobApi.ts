import api from "./axiosConfig";
import type { ProgrammingLanguage } from "../types/Language";
import type { JobPosting } from "../types/Job";
import type { AxiosResponse } from "axios";

export async function fetchTopLanguages(): Promise<ProgrammingLanguage[]> {
    const response: AxiosResponse<ProgrammingLanguage[]> = await api.get("/languages");
    return response.data;
}

export async function fetchJobs(): Promise<JobPosting[]> {
    const response: AxiosResponse<JobPosting[]> = await api.get("/jobs");
    return response.data;
}

export async function searchJobs(query: string): Promise<JobPosting[]> {
    const response: AxiosResponse<JobPosting[]> = await api.get("/jobs/search", { params: { query } });
    return response.data;
}

export async function addJob(job: JobPosting): Promise<JobPosting> {
    const response: AxiosResponse<JobPosting> = await api.post("/jobs", job);
    return response.data;
}
