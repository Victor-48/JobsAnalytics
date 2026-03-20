import React, { useEffect, useState } from "react";
import { fetchTopLanguages } from "../api/jobApi.ts";
import type { ProgrammingLanguage } from "../types/Language.ts";
import LanguageCard from "../components/LanguageCard";
import LanguageChart from "../components/LanguageChart";
import "../styles/Jobs.css";

export default function Dashboard() {
    const [languages, setLanguages] = useState<ProgrammingLanguage[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTopLanguages()
            .then(setLanguages)
            .catch(() => setError("Could not load language data."));
    }, []);

    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Top Programming Languages</h1>
            <LanguageChart languages={languages} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {languages.map((lang) => (
                    <LanguageCard key={lang.name} language={lang} />
                ))}
            </div>
        </div>
    );
}
