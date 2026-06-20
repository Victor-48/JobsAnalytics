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
}

// --- Robust Color Converter ---
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
    return 'rgba(0, 0, 0, 0.5)'; // Fallback
};


const MemoizedNetworkGraphChart = ({ data, highlightedNode, onNodeClick, onBackgroundClick, onLinkClick }: NetworkGraphChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<ForceGraphMethods>();
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });
    const theme = useTheme(); // Use the theme hook

    const sanitizedData = useMemo(() => ({
        nodes: data.nodes.map(node => ({
            ...node,
            id: DOMPurify.sanitize(node.id || '')
        })),
        links: data.links,
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
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 400,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Memoize colors to re-calculate only when the theme changes
    const { nodeColor, linkColor, textColor, bgColor } = useMemo(() => {
        const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return {
            nodeColor: `hsl(${getCssVar('--primary')})`,
            linkColor: `hsl(${getCssVar('--border')})`,
            textColor: `hsl(${getCssVar('--foreground')})`,
            bgColor: `hsl(${getCssVar('--card')})`,
        };
    }, [theme]);

    if (!data || data.nodes.length === 0) {
        return <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">Not enough data to render the network graph.</div>;
    }

    const getNodeColor = (node: NodeObject) => {
        const isHighlighted = !highlightedNode || highlightedNodes.has(node.id as string);
        return toRgba(nodeColor, isHighlighted ? 1.0 : 0.2);
    };

    const getLinkColor = (link: LinkObject) => {
        const isHighlighted = !highlightedNode || highlightedLinks.has(link);
        return toRgba(linkColor, isHighlighted ? 0.7 : 0.1);
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
                    linkWidth={link => {
                        const isHighlighted = !highlightedNode || highlightedLinks.has(link);
                        return isHighlighted ? Math.max(1, (link.value || 1) / 5) : 1;
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
                    onEngineStop={() => fgRef.current?.pauseAnimation()}
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                />
            )}
        </div>
    );
};

export const NetworkGraphChart = memo(MemoizedNetworkGraphChart);