import React, {createContext, useContext, ReactNode, useEffect, useState} from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    fetchSalaryByIndustry,
    fetchSalaryByExperience,
    fetchRemoteVsOnsiteStats,
    fetchEmploymentTypeDistribution,
    fetchTopSkills,
    fetchJobPostingsOverTime,
    fetchEmergingTechIndex
} from '../api/jobApi';

import { NACE_SECTORS } from '../pages/AddJob';

interface AnalyticsData {
    salaryByIndustry: any[];
    jobsByExperience: any[];
    remoteVsOnsite: any[];
    employmentType: any[];
    topSkills: any[];
    postingsOverTime: any[];
    emergingTech: any[];
}

interface AnalyticsContextType {
    data: AnalyticsData;
    isLoading: boolean;
    error: Error | null;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
};

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
    const { data: salaryByIndustryData, isLoading: isLoadingSalary } = useQuery({
        queryKey: ['salaryByIndustry'],
        queryFn: fetchSalaryByIndustry,
    });

    const { data: jobsByExperienceData, isLoading: isLoadingExperience } = useQuery({
        queryKey: ['jobsByExperience'],
        queryFn: fetchSalaryByExperience,
    });

    const { data: remoteVsOnsiteData, isLoading: isLoadingRemote } = useQuery({
        queryKey: ['remoteVsOnsite'],
        queryFn: fetchRemoteVsOnsiteStats,
    });

    const { data: employmentTypeData, isLoading: isLoadingEmployment } = useQuery({
        queryKey: ['employmentTypeDistribution'],
        queryFn: fetchEmploymentTypeDistribution,
    });

    const { data: topSkillsData, isLoading: isLoadingSkills } = useQuery({
        queryKey: ['topSkills'],
        queryFn: fetchTopSkills,
    });

    const { data: emergingTechData, isLoading: isLoadingEmergingTech } = useQuery({
        queryKey: ['emergingTech'],
        queryFn: fetchEmergingTechIndex,
    });

    const { data: postingsOverTimeRaw, isLoading: isLoadingPostings } = useQuery({
        queryKey: ['postingsOverTime'],
        queryFn: fetchJobPostingsOverTime,
    });

    const [formattedData, setFormattedData] = useState<AnalyticsData>({
        salaryByIndustry: [],
        jobsByExperience: [],
        remoteVsOnsite: [],
        employmentType: [],
        topSkills: [],
        postingsOverTime: [],
        emergingTech: [],
    });

    useEffect(() => {
        const formatData = () => {
            const salaryByIndustry = salaryByIndustryData ? Object.keys(salaryByIndustryData).map(key => {
                const nace = NACE_SECTORS.find((n: any) => n.code === key);
                return {
                    code: key,
                    name: nace ? (nace.description.length > 20 ? nace.description.substring(0, 20) + '...' : nace.description) : key,
                    salary: Math.round(salaryByIndustryData[key])
                };
            }) : [];

            const jobsByExperience = jobsByExperienceData ? Object.keys(jobsByExperienceData).map(key => ({ name: key, count: jobsByExperienceData[key] })) : [];
            const remoteVsOnsite = remoteVsOnsiteData ? Object.keys(remoteVsOnsiteData).map(key => ({ name: key, salary: Math.round(remoteVsOnsiteData[key]) })) : [];
            const employmentType = employmentTypeData ? Object.keys(employmentTypeData).map(key => ({ name: key, count: employmentTypeData[key] })) : [];
            const topSkills = topSkillsData || [];
            const emergingTech = emergingTechData || [];
            
            const postingsOverTime = postingsOverTimeRaw ? Object.keys(postingsOverTimeRaw)
                .sort((a, b) => new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime())
                .map(key => ({ date: key, count: postingsOverTimeRaw[key], name: key, value: postingsOverTimeRaw[key] })) : [];

            setFormattedData({ salaryByIndustry, jobsByExperience, remoteVsOnsite, employmentType, topSkills, postingsOverTime, emergingTech });
        };
        formatData();
    }, [salaryByIndustryData, jobsByExperienceData, remoteVsOnsiteData, employmentTypeData, topSkillsData, emergingTechData, postingsOverTimeRaw]);

    const isLoading = isLoadingSalary || isLoadingExperience || isLoadingRemote || isLoadingEmployment || isLoadingSkills || isLoadingPostings || isLoadingEmergingTech;

    const value = {
        data: formattedData,
        isLoading,
        error: null,
    };

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};
