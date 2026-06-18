import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchKeyIndicators, type KeyIndicator } from '../api/jobApi';

const getTrendColor = (trend: string): string => {
    if (trend.includes('+')) return "text-emerald-500";
    if (trend.includes('-')) return "text-rose-500";
    if (trend.toLowerCase().includes('new')) return "text-amber-500";
    return "text-muted-foreground";
};

const KeyIndicators = () => {
    const { data: indicators, isLoading, isError } = useQuery<KeyIndicator[], Error>({
        queryKey: ['keyIndicators'],
        queryFn: fetchKeyIndicators,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card border border-border p-6 rounded-2xl h-[120px]">
                        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError || !indicators) {
        return <div className="text-destructive mb-8">Failed to load key indicators.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {indicators.map((indicator: KeyIndicator, index: number) => (
                <div key={index} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{indicator.title}</h3>
                    <p className="text-4xl font-bold text-foreground">{indicator.value}</p>
                    <p className={`text-xs font-medium mt-2 ${getTrendColor(indicator.trend)}`}>{indicator.trend}</p>
                </div>
            ))}
        </div>
    );
};

export default KeyIndicators;