import React, { useState, useEffect } from 'react';
import { getOccupations, getSkills, searchSkills, searchOccupations, OccupationDetailDTO, SkillSummaryDTO } from '../api/escoApi';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

export default function EscoExplorer() {
    const [view, setView] = useState<'table' | 'graph'>('table');
    const [occupations, setOccupations] = useState<OccupationDetailDTO[]>([]);
    const [skills, setSkills] = useState<SkillSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Search states
    const [occSearch, setOccSearch] = useState('');
    const [skillSearch, setSkillSearch] = useState('');
    const [graphSearch, setGraphSearch] = useState('');
    
    // Graph Data state
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const fgRef = React.useRef<any>();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch first 50 occupations and their nested skills for demonstration
                const occRes = await getOccupations(0, 50);
                const skillRes = await getSkills(0, 50);
                
                setOccupations(occRes.content);
                setSkills(skillRes.content);

                // Build Graph Data
                const nodes: any[] = [];
                const links: any[] = [];

                occRes.content.forEach(occ => {
                    nodes.push({ id: occ.uri, name: occ.name, group: 'Occupation', val: 5 });
                    occ.skills.forEach(skill => {
                        if (!nodes.find(n => n.id === skill.uri)) {
                            nodes.push({ id: skill.uri, name: skill.name, group: 'Skill', val: 3 });
                        }
                        links.push({ source: occ.uri, target: skill.uri });
                    });
                });

                setGraphData({ nodes, links });
            } catch (err) {
                console.error("Error fetching ESCO data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handler = setTimeout(async () => {
            try {
                if (occSearch.trim()) {
                    const res = await searchOccupations(occSearch, 0, 50);
                    setOccupations(res.content);
                } else {
                    const res = await getOccupations(0, 50);
                    setOccupations(res.content);
                }
            } catch (err) { console.error(err); }
        }, 500);
        return () => clearTimeout(handler);
    }, [occSearch]);

    useEffect(() => {
        const handler = setTimeout(async () => {
            try {
                if (skillSearch.trim()) {
                    const res = await searchSkills(skillSearch, 0, 50);
                    setSkills(res.content);
                } else {
                    const res = await getSkills(0, 50);
                    setSkills(res.content);
                }
            } catch (err) { console.error(err); }
        }, 500);
        return () => clearTimeout(handler);
    }, [skillSearch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Tabs value={view} onValueChange={(val) => setView(val as 'table' | 'graph')} className="max-w-7xl mx-auto p-6 space-y-6 flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">ESCO Explorer</h1>
                    <p className="text-muted-foreground mt-1">Navigate the European Skills, Competences, and Occupations taxonomy.</p>
                </div>
                <TabsList className="grid w-full grid-cols-2 md:w-auto">
                    <TabsTrigger value="table">Data Tables</TabsTrigger>
                    <TabsTrigger value="graph">Network Graph</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="graph" className="mt-6 border border-border rounded-xl bg-card overflow-hidden h-[70vh] relative shadow-sm">
                <div className="absolute top-4 right-4 z-10 w-64 shadow-md rounded-md">
                    <div className="relative bg-background rounded-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search node in graph..."
                            value={graphSearch}
                            onChange={(e) => {
                                setGraphSearch(e.target.value);
                                if (e.target.value.trim() && fgRef.current) {
                                    const query = e.target.value.toLowerCase();
                                    const node = graphData.nodes.find((n: any) => n.name.toLowerCase().includes(query));
                                    if (node) {
                                        fgRef.current.centerAt(node.x, node.y, 1000);
                                        fgRef.current.zoom(4, 1000);
                                    }
                                }
                            }}
                            className="pl-9 bg-background/80 backdrop-blur-sm border-border/50"
                        />
                    </div>
                </div>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel="name"
                    nodeAutoColorBy="group"
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={d => 0.01}
                    backgroundColor="transparent"
                    onNodeDragStart={(node) => {
                        graphData.nodes.forEach((n: any) => {
                            if (n.id !== node.id) {
                                n.fx = n.x;
                                n.fy = n.y;
                            }
                        });
                    }}
                    onNodeDragEnd={(node) => {
                        node.fx = node.x;
                        node.fy = node.y;
                    }}
                />
            </TabsContent>

            <TabsContent value="table" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="font-semibold text-foreground">Occupations</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search occupations..."
                                value={occSearch}
                                onChange={(e) => setOccSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </div>
                    <div className="overflow-auto max-h-[60vh]">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="font-medium">Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {occupations.map(occ => (
                                    <TableRow key={occ.conceptUri}>
                                        <TableCell>{occ.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="font-semibold text-foreground">Skills</h2>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search skills..."
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>
                    </div>
                    <div className="overflow-auto max-h-[60vh]">
                        <Table>
                            <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="font-medium">Name</TableHead>
                                    <TableHead className="font-medium">Type</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skills.map(skill => (
                                    <TableRow key={skill.conceptUri}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-normal">
                                                {skill.skillType || 'skill/competence'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}
