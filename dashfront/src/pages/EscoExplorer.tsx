import React, { useState, useEffect } from 'react';
import { getOccupations, getSkills, OccupationDetailDTO, SkillSummaryDTO } from '../api/escoApi';
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2 } from 'lucide-react';

export default function EscoExplorer() {
    const [view, setView] = useState<'table' | 'graph'>('table');
    const [occupations, setOccupations] = useState<OccupationDetailDTO[]>([]);
    const [skills, setSkills] = useState<SkillSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Graph Data state
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">ESCO Explorer</h1>
                    <p className="text-muted-foreground">Navigate the European Skills, Competences, and Occupations taxonomy.</p>
                </div>
                <div className="flex space-x-2 bg-secondary p-1 rounded-lg">
                    <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setView('table')}
                    >
                        Data Tables
                    </button>
                    <button 
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'graph' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        onClick={() => setView('graph')}
                    >
                        Network Graph
                    </button>
                </div>
            </div>

            {view === 'graph' ? (
                <div className="border rounded-xl bg-card overflow-hidden h-[70vh]">
                    <ForceGraph2D
                        graphData={graphData}
                        nodeLabel="name"
                        nodeAutoColorBy="group"
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={d => 0.01}
                        backgroundColor="transparent"
                        linkColor={() => 'rgba(150, 150, 150, 0.2)'}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-xl bg-card overflow-hidden">
                        <div className="p-4 border-b bg-muted/30">
                            <h2 className="font-semibold">Occupations</h2>
                        </div>
                        <div className="overflow-auto max-h-[60vh]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {occupations.map(occ => (
                                        <tr key={occ.uri} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3">{occ.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="border rounded-xl bg-card overflow-hidden">
                        <div className="p-4 border-b bg-muted/30">
                            <h2 className="font-semibold">Skills</h2>
                        </div>
                        <div className="overflow-auto max-h-[60vh]">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {skills.map(skill => (
                                        <tr key={skill.uri} className="border-b last:border-0 hover:bg-muted/20">
                                            <td className="px-4 py-3">{skill.name}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                                                    {skill.skillType || 'skill/competence'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
