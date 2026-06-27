import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import DOMPurify from 'dompurify';
import type { GraphData } from '../api/jobApi';
import { useTheme } from '../hooks/useTheme';

interface NetworkGraphChartProps {
    data: GraphData;
    highlightedNode: NodeObject | null;
    onNodeClick: (node: NodeObject) => void;
    onBackgroundClick: () => void;
    onLinkClick?: (link: LinkObject) => void;
    isTrendMode?: boolean;
}

// --- Color Converter ---
const toRgba = (color: string, alpha: number): string => {
    const tempDiv = document.createElement('div');
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    const rgb = computedColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
        return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
    }
    return 'rgba(0, 0, 0, 0.5)';
};

const MemoizedNetworkGraphChart = ({ data, highlightedNode, onNodeClick, onBackgroundClick, onLinkClick, isTrendMode = false }: NetworkGraphChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const theme = useTheme();

    const sanitizedData = useMemo(() => ({
        nodes: data.nodes.map(node => ({
            ...node,
            id: DOMPurify.sanitize(node.id || '')
        })),
        links: data.links.map(link => ({
            ...link,
            source: typeof link.source === 'object' && link.source ? (link.source as any).id : link.source,
            target: typeof link.target === 'object' && link.target ? (link.target as any).id : link.target
        })),
    }), [data]);

    const { highlightedNodes, highlightedLinks } = useMemo(() => {
        if (!highlightedNode) {
            return { highlightedNodes: new Set(), highlightedLinks: new Set() };
        }

        const nodes = new Set([highlightedNode.id]);
        const links = new Set();

        sanitizedData.links.forEach((link: any) => {
            if (link.source.id === highlightedNode.id) {
                nodes.add(link.target.id);
                links.add(link);
            } else if (link.target.id === highlightedNode.id) {
                nodes.add(link.source.id);
                links.add(link);
            }
        });

        return { highlightedNodes: nodes, highlightedLinks: links };
    }, [highlightedNode, sanitizedData.links]);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(() => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight || 400,
                });
                
                // When container resizes (e.g. Maximize toggle), give the physics engine a gentle nudge
                // to smoothly redistribute the nodes into the newly available space
                setTimeout(() => {
                    fgRef.current?.d3ReheatSimulation();
                }, 50);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const { nodeColor, textColor, bgColor, trendEmergent, trendStable, trendFading } = useMemo(() => {
        const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return {
            nodeColor: `hsl(${getCssVar('--primary')})`,
            textColor: `hsl(${getCssVar('--foreground')})`,
            bgColor: `hsl(${getCssVar('--card')})`,
            trendEmergent: `hsl(${getCssVar('--chart-3')})`, // Orange
            trendStable: `hsl(${getCssVar('--chart-1')})`,   // Blue
            trendFading: `hsl(${getCssVar('--muted')})`,     // Gray
        };
    }, [theme]);

    if (!data || data.nodes.length === 0) {
        return <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">Not enough data to render the network graph.</div>;
    }

    const getNodeColor = (node: NodeObject) => {
        const isHighlighted = !highlightedNode || highlightedNodes.has(node.id as string);
        return toRgba(nodeColor, isHighlighted ? 1.0 : 0.2);
    };

    const getLinkColor = (link: any) => {
        const isHighlighted = !highlightedNode || highlightedLinks.has(link);

        // --- COLOR LOGIC UPDATE ---
        const isDarkMode = document.documentElement.classList.contains('dark') || theme === 'dark';
        let baseColor = isDarkMode ? '#ffffff' : '#000000';

        if (isTrendMode && link.growth !== undefined) {
            if (link.growth > 50) {
                baseColor = trendEmergent;
            } else if (link.growth < -25) {
                baseColor = trendFading;
            } else {
                baseColor = trendStable;
            }
        }

        return toRgba(baseColor, isHighlighted ? 0.7 : 0.15);
    };

    return (
        <div ref={containerRef} className="w-full h-[400px] rounded-xl overflow-hidden border border-border bg-card flex items-center justify-center relative z-0">
            {dimensions.width > 0 && (
                <ForceGraph2D
                    ref={fgRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={sanitizedData}

                    nodeVal={node => node.value || 1}
                    nodeRelSize={4}
                    nodeColor={getNodeColor}
                    linkColor={getLinkColor}

                    // --- THICKNESS LOGIC UPDATE ---
                    linkWidth={link => {
                        const isHighlighted = !highlightedNode || highlightedLinks.has(link);
                        // Increase minimum thickness to 3, and add scaling based on value
                        // Adjust the divisor (e.g., 5) depending on how large your values get
                        const scaledThickness = 3 + ((link.value || 1) / 5);

                        return isHighlighted ? scaledThickness : 1.5;
                    }}

                    nodeCanvasObject={(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
                        const label = node.id as string;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const isHighlighted = !highlightedNode || highlightedNodes.has(node.id as string);
                        ctx.fillStyle = toRgba(textColor, isHighlighted ? 1.0 : 0.3);
                        ctx.fillText(label, node.x || 0, (node.y || 0) + 12);
                    }}
                    nodeCanvasObjectMode={() => 'after'}

                    onNodeClick={onNodeClick}
                    onBackgroundClick={onBackgroundClick}
                    onLinkClick={onLinkClick}

                    backgroundColor={bgColor}
                    cooldownTicks={100}
                    warmupTicks={50}
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                />
            )}
        </div>
    );
};

export const NetworkGraphChart = memo(MemoizedNetworkGraphChart);