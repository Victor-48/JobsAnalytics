import React from 'react';

export function EmptyState() {
    return (
        <div className="p-12 flex flex-col items-center justify-center bg-card rounded-2xl border border-border border-dashed transition-colors">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No Analytics Available</h3>
            <p className="text-muted-foreground text-sm">Add some job postings to see data visualizations.</p>
        </div>
    );
}