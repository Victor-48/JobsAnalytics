import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import DOMPurify from 'dompurify';
import { fetchTechStackNetworkGraph } from '../api/jobApi';

export default function NetworkGraphChart() {
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

    useEffect(() => {
        // Fetch network data
        fetchTechStackNetworkGraph()
            .then(data => {
                if (data && data.nodes && data.links) {
                    const sanitizedNodes = data.nodes.map((node: any) => ({
                        ...node,
                        name: DOMPurify.sanitize(node.name || '')
                    }));
                    
                    setGraphData({
                        nodes: sanitizedNodes as any,
                        links: data.links as any
                    });
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                // Read exact layout width computed by CSS Grid
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: 400 // Fixed height
                });
            }
        };

        // Initial setup and listener
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, [isLoading]);

    if (isLoading) {
        return <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-border text-muted-foreground animate-pulse">Loading network graph...</div>;
    }

    if (graphData.nodes.length === 0) {
        return <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border text-muted-foreground">Not enough data to map tech stack relationships.</div>;
    }

    // Helper to get CSS variable values for colors
    const getCssVar = (name: string) => {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    };

    // Construct valid HSL strings from the CSS variables
    const jobColor = `hsl(${getCssVar('--primary')})`;
    const langColor = `hsl(${getCssVar('--chart-2')})`;
    const linkColor = `hsl(${getCssVar('--border')})`;
    const bgColor = `hsl(${getCssVar('--card')})`;

    return (
        <div ref={containerRef} className="w-full h-[400px] rounded-xl overflow-hidden border border-border bg-card flex items-center justify-center relative z-0">
            {dimensions.width > 0 && (
                <ForceGraph2D
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={(node: any) => node.group === 1 ? jobColor : langColor} // Jobs = primary, Languages = secondary chart color
                    nodeRelSize={6}
                    linkColor={() => linkColor}
                    linkWidth={1.5}
                    backgroundColor={bgColor}
                    enableNodeDrag={true}
                    enableZoomInteraction={true}
                    d3AlphaDecay={0.01}
                    d3VelocityDecay={0.08}
                />
            )}
        </div>
    );
}