import React from 'react';
import { LegendProps } from 'recharts';

interface CustomLegendProps extends LegendProps {
    maxHeight?: string;
    className?: string;
}

export const CustomLegend = (props: CustomLegendProps) => {
    const { payload, maxHeight = '120px', className = '' } = props;

    if (!payload || payload.length === 0) {
        return null;
    }

    return (
        <div 
            className={`w-full overflow-y-auto px-2 mt-2 custom-scrollbar ${className}`} 
            style={{ maxHeight }}
        >
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground m-0 p-0 list-none justify-center">
                {payload.map((entry, index) => (
                    <li key={`item-${index}`} className="flex items-center gap-1.5 whitespace-nowrap">
                        <span 
                            className="inline-block w-3 h-3 rounded-sm shrink-0" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate max-w-[150px]" title={entry.value}>
                            {entry.value}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
