import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    fetchSalaryByIndustry,
    fetchSalaryByExperience,
    fetchRemoteVsOnsiteStats,
    fetchEmploymentTypeDistribution,
} from '../api/jobApi';
import { NACE_SECTORS } from '../pages/AddJob';

interface AnalyticsData {
    salaryByIndustry: any[];
    jobsByExperience: any[];
    remoteVsOnsite: any[];
    employmentType: any[];
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

    const [formattedData, setFormattedData] = useState<AnalyticsData>({
        salaryByIndustry: [],
        jobsByExperience: [],
        remoteVsOnsite: [],
        employmentType: [],
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

            setFormattedData({ salaryByIndustry, jobsByExperience, remoteVsOnsite, employmentType });
        };
        formatData();
    }, [salaryByIndustryData, jobsByExperienceData, remoteVsOnsiteData, employmentTypeData]);

    const isLoading = isLoadingSalary || isLoadingExperience || isLoadingRemote || isLoadingEmployment;

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
