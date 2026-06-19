import api from "./axiosconfig";
import type { ProgrammingLanguage } from "../types/Language";
import type { JobPosting } from "../types/Job";
import type { AxiosResponse } from "axios";

export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    empty: boolean;
}

export interface KeyIndicator {
    title: string;
    value: string;
    trend: string;
}

export interface GraphNode {
    id: string;
    value: number;
    group: string;
}

export interface GraphLink {
    source: string;
    target: string;
    value: number;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export async function fetchTopLanguages(): Promise<ProgrammingLanguage[]> {
    const response: AxiosResponse<ProgrammingLanguage[]> = await api.get("/languages/top");
    return response.data;
}

export async function fetchJobs(remoteFlexibility?: string, industry?: string, page: number = 0, size: number = 10): Promise<PageResponse<JobPosting>> {
    const params: Record<string, string | number> = { page, size };
    if (remoteFlexibility) params.remoteFlexibility = remoteFlexibility;
    if (industry) params.industry = industry;

    const response: AxiosResponse<PageResponse<JobPosting>> = await api.get("/jobs", { params });
    return response.data;
}

export async function searchJobs(query: string, page: number = 0, size: number = 10): Promise<PageResponse<JobPosting>> {
    const response: AxiosResponse<PageResponse<JobPosting>> = await api.get("/jobs/search", { params: { query, page, size } });
    return response.data;
}

export async function addJob(job: JobPosting): Promise<JobPosting> {
    const response: AxiosResponse<JobPosting> = await api.post("/jobs", job);
    return response.data;
}

export async function updateJob(id: string, job: JobPosting): Promise<JobPosting> { // Changed id: number to id: string
    const response: AxiosResponse<JobPosting> = await api.put(`/jobs/${id}`, job);
    return response.data;
}

// Analytics endpoints

export async function fetchKeyIndicators(): Promise<KeyIndicator[]> {
    const response: AxiosResponse<KeyIndicator[]> = await api.get("/jobs/stats/key-indicators");
    return response.data;
}

export async function fetchSkillCoOccurrence(startDate?: string, endDate?: string): Promise<GraphData> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response: AxiosResponse<GraphData> = await api.get("/languages/co-occurrence", { params });
    return response.data;
}

export async function fetchJobTitlesBySkills(skill1: string, skill2: string): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/by-skills", {
        params: { skill1, skill2 }
    });
    return response.data;
}

export async function fetchSalaryByIndustry(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/salary-by-industry");
    return response.data;
}

export async function fetchSalaryByExperience(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/salary-by-experience");
    return response.data;
}

export async function fetchRemoteVsOnsiteStats(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/remote-vs-onsite");
    return response.data;
}

export async function fetchEmploymentTypeDistribution(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/employment-type");
    return response.data;
}

export async function fetchJobPostingsOverTime(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/postings-over-time");
    return response.data;
}

export async function fetchSubSectorsByNaceCode(naceCode: string): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get(`/jobs/stats/sub-sectors/${naceCode}`);
    return response.data;
}

export async function fetchJobLocations(): Promise<Record<string, number>> {
    const response: AxiosResponse<Record<string, number>> = await api.get("/jobs/stats/locations");
    return response.data;
}

export async function queryLlmChart(query: string): Promise<any> {
    const response: AxiosResponse<any> = await api.post("/llm/query", { query });
    return response.data;
}