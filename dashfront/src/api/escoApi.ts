import api from "./axiosconfig";

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface SectorDTO {
    uri: string;
    name: string;
}

export interface ISCOGroupDTO {
    uri: string;
    code: string;
    name: string;
}

export interface SkillGroupDTO {
    uri: string;
    code: string;
    name: string;
}

export interface SkillSummaryDTO {
    uri: string;
    name: string;
    skillType: string;
}

export interface OccupationDetailDTO {
    uri: string;
    name: string;
    description: string;
    skills: SkillSummaryDTO[];
}

export async function getSectors(page = 0, size = 10): Promise<PageResponse<SectorDTO>> {
    const res = await api.get(`/esco/sectors?page=${page}&size=${size}`);
    return res.data;
}

export async function getISCOGroups(page = 0, size = 10): Promise<PageResponse<ISCOGroupDTO>> {
    const res = await api.get(`/esco/isco-groups?page=${page}&size=${size}`);
    return res.data;
}

export async function getSkillGroups(page = 0, size = 10): Promise<PageResponse<SkillGroupDTO>> {
    const res = await api.get(`/esco/skill-groups?page=${page}&size=${size}`);
    return res.data;
}

export async function getSkills(page = 0, size = 10): Promise<PageResponse<SkillSummaryDTO>> {
    const res = await api.get(`/esco/skills?page=${page}&size=${size}`);
    return res.data;
}

export async function searchSkills(q: string, page = 0, size = 10): Promise<PageResponse<SkillSummaryDTO>> {
    const res = await api.get(`/search/skills?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
    return res.data;
}

export async function searchOccupations(q: string, page = 0, size = 10): Promise<PageResponse<OccupationDetailDTO>> {
    const res = await api.get(`/search/occupations?q=${encodeURIComponent(q)}&page=${page}&size=${size}`);
    return res.data;
}

export async function getOccupations(page = 0, size = 10): Promise<PageResponse<OccupationDetailDTO>> {
    const res = await api.get(`/esco/occupations?page=${page}&size=${size}`);
    return res.data;
}
