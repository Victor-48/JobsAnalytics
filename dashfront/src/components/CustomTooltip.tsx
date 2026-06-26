import React from 'react';

// This is a standard structure for a recharts custom tooltip
const CustomTooltip = ({ active, payload, label, formatter, labelFormatter }: any) => {
    if (active && payload && payload.length) {
        const finalLabel = labelFormatter ? labelFormatter(label) : label;
        return (
            <div className="bg-card p-3 shadow-lg rounded-md border border-border">
                {finalLabel && <p className="font-bold text-card-foreground mb-1">{finalLabel}</p>}
                {payload.map((entry: any, index: number) => {
                    const formatted = formatter ? formatter(entry.value, entry.name, entry, index, payload) : [entry.value, entry.name];
                    const val = Array.isArray(formatted) ? formatted[0] : formatted;
                    const name = Array.isArray(formatted) ? formatted[1] : entry.name;
                    return (
                        <p key={index} className="text-sm text-card-foreground flex items-center gap-2 m-0 mt-1">
                            <span style={{ color: entry.color || entry.fill || 'hsl(var(--primary))' }}>■</span> 
                            <span>{name}:</span>
                            <span className="font-medium">{val}</span>
                        </p>
                    );
                })}
            </div>
        );
    }

    return null;
};

export default CustomTooltip;