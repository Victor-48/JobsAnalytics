import React, { useEffect, useState, useRef, memo, useMemo } from 'react';
import ForceGraph2D, { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d';
import DOMPurify from 'dompurify';
import type { GraphData } from '../api/jobApi';

interface NetworkGraphChartProps {
    data: GraphData;
    highlightedNode: NodeObject | null;
    onNodeClick: (node: NodeObject) => void;
    onBackgroundClick: () => void;
}

const MemoizedNetworkGraphChart = ({ data, highlightedNode, onNodeClick, onBackgroundClick }: NetworkGraphChartProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<ForceGraphMethods>();
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

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

    if (!data || data.nodes.length === 0) {
        return <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">Not enough data to render the network graph.</div>;
    }

    const getCssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const nodeColor = `hsl(${getCssVar('--primary')})`;
    const linkColor = `hsl(${getCssVar('--border')})`;
    const textColor = `hsl(${getCssVar('--foreground')})`;
    const bgColor = `hsl(${getCssVar('--card')})`;

    const getNodeColor = (node: NodeObject) => {
        if (highlightedNode && !highlightedNodes.has(node.id as string)) {
            return `${nodeColor}80`; // 50% opacity
        }
        return nodeColor;
    };

    const getLinkColor = (link: LinkObject) => {
        if (highlightedNode && !highlightedLinks.has(link)) {
            return `${linkColor}80`; // 50% opacity
        }
        return linkColor;
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
                    linkWidth={link => Math.max(1, (link.value || 1) / 5)}
                    
                    nodeCanvasObject={(node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
                        const label = node.id as string;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px Sans-Serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = highlightedNode && !highlightedNodes.has(node.id as string) ? `${textColor}80` : textColor;
                        ctx.fillText(label, node.x || 0, (node.y || 0) + 12);
                    }}
                    nodeCanvasObjectMode={() => 'after'}

                    onNodeClick={onNodeClick}
                    onBackgroundClick={onBackgroundClick}

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