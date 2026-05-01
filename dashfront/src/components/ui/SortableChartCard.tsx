import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SwitchIcon, DragHandleIcon, PercentageIcon, HashIcon, FloatIcon, SaveIcon } from './Icons';

export function SortableChartCard({ chart, children, onToggleType, displayType, onToggleUnit, displayUnit, isOverlay, onToggleFloat, isFloating, onSave }: any) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: chart?.id || 'overlay' });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: chart?.fullWidth ? '1 / -1' : 'span 1',
        zIndex: isDragging || isOverlay ? 50 : 1, 
        opacity: isDragging && !isOverlay ? 0.3 : 1, 
    };

    if (!chart) return null;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`chart-container bg-card p-6 rounded-xl shadow-sm border border-border flex flex-col transition-all text-card-foreground ${isOverlay ? 'shadow-2xl scale-[1.02] border-primary ring-2 ring-primary/20 cursor-grabbing' : 'hover:shadow-md'} ${isFloating ? 'ring-2 ring-primary opacity-50' : ''}`}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold m-0 text-lg tracking-tight">{chart.title}</h3>
                <div className="flex items-center gap-3">
                    {onSave && (
                        <button onClick={onSave} className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Save this insight">
                            <SaveIcon />
                        </button>
                    )}
                    {onToggleFloat && (
                         <button onClick={onToggleFloat} className={`p-1.5 rounded-md transition-colors ${isFloating ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-secondary'}`} title="Pop out chart">
                            <FloatIcon />
                        </button>
                    )}
                    {onToggleUnit && (
                        <button onClick={onToggleUnit} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-md transition-colors" title={`Switch to ${displayUnit === 'absolute' ? 'percentage' : 'absolute values'}`}>
                            {displayUnit === 'absolute' ? <PercentageIcon /> : <HashIcon />}
                        </button>
                    )}
                    {onToggleType && (
                        <div className="flex items-center bg-secondary rounded-md p-0.5">
                            <span className="text-xs text-muted-foreground px-2 font-medium capitalize hidden sm:inline-block">{displayType}</span>
                            <button onClick={onToggleType} className="p-1 text-muted-foreground bg-background shadow-sm hover:text-primary rounded transition-colors" title="Switch Chart Type"><SwitchIcon /></button>
                        </div>
                    )}
                    <button 
                        {...attributes} 
                        {...listeners} 
                        className={`p-1.5 rounded-md transition-colors touch-none ${isOverlay ? 'text-primary bg-primary/10 cursor-grabbing' : 'text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing hover:bg-secondary'}`}
                        title="Drag to reorder"
                    >
                        <DragHandleIcon />
                    </button>
                </div>
            </div>
            <div className="flex-grow h-[320px] min-h-0 w-full relative">{children}</div>
        </div>
    );
}