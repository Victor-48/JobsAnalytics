import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchKeyIndicators, type KeyIndicator } from '../api/jobApi';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Briefcase, Star, Users, Building2, TrendingUp, TrendingDown, Info, Activity } from 'lucide-react';

const getTrendColor = (trend: string): string => {
    if (trend.includes('+')) return "text-emerald-500";
    if (trend.includes('-')) return "text-rose-500";
    if (trend.toLowerCase().includes('new')) return "text-amber-500";
    return "text-muted-foreground";
};

const getTrendIcon = (trend: string) => {
    if (trend.includes('+')) return <TrendingUp className="w-3 h-3 mr-1" />;
    if (trend.includes('-')) return <TrendingDown className="w-3 h-3 mr-1" />;
    return <Activity className="w-3 h-3 mr-1" />;
};

const getIndicatorMeta = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('job')) return { icon: <Briefcase className="w-4 h-4" />, desc: "Total number of active job postings currently available." };
    if (t.includes('skill')) return { icon: <Star className="w-4 h-4" />, desc: "The most frequently mentioned skill across all active job postings." };
    if (t.includes('role')) return { icon: <Users className="w-4 h-4" />, desc: "The job title that appears most frequently in recent postings." };
    if (t.includes('industry')) return { icon: <Building2 className="w-4 h-4" />, desc: "The economic sector with the highest volume of current postings." };
    return { icon: <Activity className="w-4 h-4" />, desc: "Key metric tracking." };
};

const KeyIndicators = () => {
    const { data: indicators, isLoading, isError } = useQuery<KeyIndicator[], Error>({
        queryKey: ['keyIndicators'],
        queryFn: fetchKeyIndicators,
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="w-4 h-4 bg-muted rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !indicators) {
        return <div className="text-destructive mb-8 text-sm font-medium">Failed to load key indicators. Please refresh.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {indicators.map((indicator: KeyIndicator, index: number) => {
                const meta = getIndicatorMeta(indicator.title);
                return (
                    <Card key={index} className="relative overflow-hidden group border-border shadow-sm hover:shadow-md transition-shadow">
                        <div className="absolute top-0 left-4 right-4 h-1 bg-gradient-to-r from-primary to-primary/50 opacity-80 rounded-b-md" />
                        
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2 pt-6">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                {indicator.title}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[200px] text-xs">
                                        <p>{meta.desc}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <div className="text-primary/70 bg-primary/10 p-2 rounded-lg group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                                {meta.icon}
                            </div>
                        </CardHeader>
                        
                        <CardContent className="px-6 pb-6">
                            <div className="text-2xl font-bold tracking-tight text-foreground line-clamp-2 leading-tight h-14 flex items-center" title={indicator.value}>
                                {indicator.value}
                            </div>
                            <div className={`flex items-center text-xs font-medium mt-1 ${getTrendColor(indicator.trend)}`}>
                                {getTrendIcon(indicator.trend)}
                                {indicator.trend}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

export default KeyIndicators;