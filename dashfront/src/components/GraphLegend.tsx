import React from 'react';

const LegendItem = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">{children}</div>
);

interface GraphLegendProps {
    isTrendMode?: boolean;
}

export const GraphLegend = ({ isTrendMode = false }: GraphLegendProps) => {
    return (
        <div className="border-t border-border mt-4 pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {isTrendMode ? (
                <>
                    <LegendItem>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                        <span>Emergent Trend (&gt;50% growth)</span>
                    </LegendItem>
                    <LegendItem>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                        <span>Stable</span>
                    </LegendItem>
                    <LegendItem>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted))' }} />
                        <span>Fading Trend (&lt;-25% growth)</span>
                    </LegendItem>
                </>
            ) : (
                <>
                    <LegendItem>
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Skill / Technology</span>
                    </LegendItem>
                    <LegendItem>
                        <div className="w-8 h-px bg-border" />
                        <span>Co-occurrence in Jobs</span>
                    </LegendItem>
                    <LegendItem>
                        <strong>Node Size:</strong> Total jobs requiring the skill
                    </LegendItem>
                    <LegendItem>
                        <strong>Link Thickness:</strong> Strength of co-occurrence
                    </LegendItem>
                    <LegendItem>
                        <span className="text-primary font-semibold">[Click Link]</span> to see job titles
                    </LegendItem>
                </>
            )}
        </div>
    );
};