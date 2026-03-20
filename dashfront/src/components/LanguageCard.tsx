import React from "react";
import type { ProgrammingLanguage } from "../types/Language.ts";
import "../styles/LanguageCard.css";

interface Props {
    language: ProgrammingLanguage;
}

export default function LanguageCard({ language }: Props) {
    return (
        <div className="border rounded-lg shadow p-4 hover:shadow-lg transition">
            <h3 className="font-bold text-lg">{language.name}</h3>
            <p>Job Count: {language.jobCount}</p>
            <p>Popularity Score: {language.popularityScore.toFixed(2)}</p>
        </div>
    );
}
