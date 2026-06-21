import React, { useState, useRef, useEffect } from 'react';
import { MinusSquare, Expand } from 'lucide-react';

export function FloatingWindow({ chart, onClose, children, index }: any) {
    const [pos, setPos] = useState({ x: -1000, y: -1000 });
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

    useEffect(() => {
        // Stagger positions based on index so multiple windows don't perfectly overlap.
        const startX = Math.max(20, window.innerWidth - 450 - (index * 30));
        const startY = Math.max(80, window.innerHeight - 380 - (index * 30));
        setPos({ x: startX, y: startY });
    }, [index]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;
        
        dragRef.current = { startX: e.clientX, startY: e.clientY, initialX: pos.x, initialY: pos.y };
        setIsDragging(true);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (isDragging && dragRef.current) {
            let dx = e.clientX - dragRef.current.startX;
            let dy = e.clientY - dragRef.current.startY;
            let newX = dragRef.current.initialX + dx;
            let newY = dragRef.current.initialY + dy;

            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            const componentWidth = isMinimized ? 250 : 420;
            const componentHeight = isMinimized ? 50 : 300;

            newX = Math.max(0, Math.min(newX, windowWidth - componentWidth));
            newY = Math.max(0, Math.min(newY, windowHeight - componentHeight));

            setPos({ x: newX, y: newY });
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        dragRef.current = null;
        (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        // If maximizing and off-screen, pull it back in
        if (isMinimized) {
            setPos(current => ({
                x: Math.min(current.x, window.innerWidth - 420),
                y: Math.min(current.y, window.innerHeight - 300)
            }));
        }
    };

    // --- Dynamic Styles based on state ---
    const containerClasses = isMinimized
        ? `fixed z-[100] bg-card border border-primary/50 shadow-md shadow-primary/20 rounded-lg py-2 px-4 transition-all duration-300 w-auto min-w-[200px] flex items-center justify-between cursor-grab active:cursor-grabbing`
        : `fixed z-[100] w-[420px] bg-card border border-border rounded-xl p-4 transition-all duration-300 shadow-2xl ${isDragging ? 'opacity-100 ring-2 ring-primary/50 scale-[1.01]' : 'opacity-95 hover:opacity-100 scale-100'}`;

    return (
        <div
            className={containerClasses}
            style={{
                left: pos.x,
                top: pos.y,
                // Disable smooth transition while dragging for responsiveness
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {isMinimized ? (
                <>
                    <h4 className="font-bold text-sm text-primary truncate max-w-[150px]">{chart.title}</h4>
                    <div className="flex items-center gap-1">
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={toggleMinimize}
                            className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                            title="Expand"
                        >
                            <Expand className="w-4 h-4" />
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={onClose}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                            title="Close"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                </>
            ) : (
                // --- Maximized View ---
                <>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50 cursor-grab active:cursor-grabbing touch-none">
                        <div className="flex items-center gap-2 select-none text-muted-foreground hover:text-foreground transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="12" r="1" />
                                <circle cx="9" cy="5" r="1" />
                                <circle cx="9" cy="19" r="1" />
                                <circle cx="15" cy="12" r="1" />
                                <circle cx="15" cy="5" r="1" />
                                <circle cx="15" cy="19" r="1" />
                            </svg>
                            <h4 className="font-bold text-sm text-foreground truncate max-w-[280px]">{chart.title}</h4>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={toggleMinimize}
                                className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded hover:bg-primary/10 cursor-pointer"
                                title="Minimize"
                            >
                                <MinusSquare className="w-4 h-4" />
                            </button>
                            <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={onClose}
                                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10 cursor-pointer"
                                title="Close"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                    </div>
                    <div className="h-56 pointer-events-auto relative">
                        {isDragging && <div className="absolute inset-0 z-50"></div>}
                        {children}
                    </div>
                </>
            )}
        </div>
    );
}