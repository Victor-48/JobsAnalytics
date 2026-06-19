import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchJobTitlesBySkills } from '../api/jobApi';

interface CoOccurrenceModalProps {
    skill1: string;
    skill2: string;
    onClose: () => void;
}

export const CoOccurrenceModal = ({ skill1, skill2, onClose }: CoOccurrenceModalProps) => {
    const { data: jobTitles, isLoading, isError } = useQuery({
        queryKey: ['jobTitles', skill1, skill2],
        queryFn: () => fetchJobTitlesBySkills(skill1, skill2),
    });

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 m-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Co-occurrence Context</h2>
                        <p className="text-sm text-muted-foreground">
                            Job roles requiring both <span className="font-semibold text-primary">{skill1}</span> and <span className="font-semibold text-primary">{skill2}</span>.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">&times;</button>
                </div>

                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {isLoading && <p>Loading...</p>}
                    {isError && <p className="text-destructive">Failed to load data.</p>}
                    {jobTitles && (
                        <ul className="space-y-2">
                            {Object.entries(jobTitles).map(([title, count]) => (
                                <li key={title} className="flex justify-between items-center text-sm bg-muted/50 px-3 py-2 rounded-md">
                                    <span className="text-foreground">{title}</span>
                                    <span className="font-mono text-xs bg-background border px-2 py-0.5 rounded">{count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};