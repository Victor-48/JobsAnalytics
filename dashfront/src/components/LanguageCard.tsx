import type { ProgrammingLanguage } from "../types/Language";
import "../styles/LanguageCard.css";

interface Props {
    language: ProgrammingLanguage;
}

export default function LanguageCard({ language }: Props) {
    if (!language || !language.name) {
        return null;
    }

    return (
        <div className="bg-background border border-border shadow-sm rounded-xl p-4 hover:shadow-md transition-all group flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                    {language.name.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-foreground text-sm tracking-tight">{language.name}</h3>
                    <p className="text-muted-foreground text-xs font-medium mt-0.5">
                        Active Postings
                    </p>
                </div>
            </div>
            <div className="text-right">
                 <span className="text-lg font-black text-primary">{language.jobCount || 0}</span>
            </div>
        </div>
    );
}