import type { SectorDTO, OccupationDetailDTO, SkillSummaryDTO } from "../api/escoApi";

export interface JobPosting {
    id?: string;
    title: string;
    company: string;
    location: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    postedDate: string;

    // Analytics fields
    salary?: number;
    currency?: string;
    experienceLevel?: string;
    remoteFlexibility?: string;
    employmentType?: string;
    satisfactionScore?: number;

    // ESCO-NACE Input fields
    sectorUri?: string;
    occupationUri?: string;
    requiredSkillUris?: string[];

    // ESCO-NACE Output objects
    sector?: SectorDTO;
    occupation?: OccupationDetailDTO;
    requiredSkills?: SkillSummaryDTO[];
}