import React, { useState, useRef, useEffect } from 'react';

export function FloatingWindow({ chart, onClose, children, index }: any) {
    const [pos, setPos] = useState({ x: -1000, y: -1000 }); // Render off-screen initially
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

    useEffect(() => {
        // Initialize position on mount.
        // Stagger positions based on index so multiple windows don't perfectly overlap.
        const startX = Math.max(20, window.innerWidth - 450 - (index * 30));
        const startY = Math.max(80, window.innerHeight - 380 - (index * 30));
        setPos({ x: startX, y: startY });
    }, [index]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Prevent dragging if clicking the close button
        if ((e.target as HTMLElement).closest('button')) return;
        
        dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
        setIsDragging(true);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging && dragRef.current) {
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            setPos({ x: dragRef.current.initialX + dx, y: dragRef.current.initialY + dy });
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        dragRef.current = null;
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    };

    return (
        <div 
            className={`fixed z-[100] w-[420px] bg-card border border-border rounded-xl p-4 transition-opacity shadow-2xl ${isDragging ? 'opacity-100 ring-2 ring-primary/50 scale-[1.01]' : 'opacity-95 hover:opacity-100 scale-100'}`}
            style={{ left: pos.x, top: pos.y, transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s' }}
        >
            <div 
                className="flex justify-between items-center mb-3 pb-2 border-b border-border/50 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <div className="flex items-center gap-2 select-none text-muted-foreground hover:text-foreground transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="12" r="1" />
                        <circle cx="9" cy="5" r="1" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="15" cy="12" r="1" />
                        <circle cx="15" cy="5" r="1" />
                        <circle cx="15" cy="19" r="1" />
                    </svg>
                    <h4 className="font-bold text-sm text-foreground">{chart.title}</h4>
                </div>
                <button 
                    onPointerDown={(e) => e.stopPropagation()} 
                    onClick={onClose} 
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10 cursor-pointer"
                    title="Close"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
            <div className="h-56 pointer-events-auto relative">
                {/* An invisible overlay that sits above the chart while dragging to prevent Recharts from stealing pointer events */}
                {isDragging && <div className="absolute inset-0 z-50"></div>}
                {children}
            </div>
        </div>
    );
}