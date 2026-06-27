import React from 'react';

export const SwitchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export const DragHandleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
    </svg>
);

export const PercentageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19"></line>
        <circle cx="6.5" cy="6.5" r="2.5"></circle>
        <circle cx="17.5" cy="17.5" r="2.5"></circle>
    </svg>
);

export const HashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9"></line>
        <line x1="4" y1="15" x2="20" y2="15"></line>
        <line x1="10" y1="3" x2="8" y2="21"></line>
        <line x1="16" y1="3" x2="14" y2="21"></line>
    </svg>
);

export const FloatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 3H3v18h18V3z" />
        <path d="M21 9H3" />
        <path d="m15 14 3-3-3-3" />
        <path d="M9 14 6 11l3-3" />
    </svg>
);

export const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
);

export const SortIcon = ({ direction }: { direction: 'asc' | 'desc' | 'none' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'asc' && (
            <>
                <line x1="4" y1="6" x2="13" y2="6" />
                <line x1="4" y1="12" x2="10" y2="12" />
                <line x1="4" y1="18" x2="7" y2="18" />
                <line x1="17" y1="20" x2="17" y2="4" />
                <polyline points="14 7 17 4 20 7" />
            </>
        )}
        {direction === 'desc' && (
            <>
                <line x1="4" y1="6" x2="7" y2="6" />
                <line x1="4" y1="12" x2="10" y2="12" />
                <line x1="4" y1="18" x2="13" y2="18" />
                <line x1="17" y1="4" x2="17" y2="20" />
                <polyline points="14 17 17 20 20 17" />
            </>
        )}
        {direction === 'none' && (
            <>
                <line x1="4" y1="6" x2="13" y2="6" />
                <line x1="4" y1="12" x2="10" y2="12" />
                <line x1="4" y1="18" x2="13" y2="18" />
                <line x1="17" y1="4" x2="17" y2="20" />
                <polyline points="14 7 17 4 20 7" />
                <polyline points="14 17 17 20 20 17" />
            </>
        )}
    </svg>
);