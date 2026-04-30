export interface JobPosting {
    id?: string;
    title: string;
    company: string;
    location: string;
    postedDate: string;
    requiredLanguages: string[];

    // Analytics fields
    salary?: number;
    currency?: string;
    experienceLevel?: string;
    industry?: string;
    naceCode?: string; // Added NACE Code
    remoteFlexibility?: string;
    employmentType?: string;
    satisfactionScore?: number; // Re-adding for backward compatibility if backend sends it
}