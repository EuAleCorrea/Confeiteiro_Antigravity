"use client";

import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { FAQItem } from "@/lib/help-data";
import { helpCategories } from "@/lib/help-data";

interface FAQCardProps {
    question: FAQItem;
}

export default function FAQCard({ question }: FAQCardProps) {
    const category = helpCategories.find(c => c.id === question.categoriaId);

    // Icon mapping (simplified for this component, could be a shared helper)
    const getIcon = (name?: string) => {
        switch (name) {
            case 'Rocket': return '🚀';
            case 'FileText': return '📝';
            case 'Package': return '📦';
            case 'Cake': return '🎂';
            case 'DollarSign': return '💰';
            case 'BarChart': return '📊';
            case 'Settings': return '⚙️';
            default: return '❓';
        }
    };

    return (
        <Link
            href={`/ajuda/faq/${question.id}`}
            className="group block bg-white border border-border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all h-full flex flex-col"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="bg-gray-50 text-xs font-bold text-text-secondary px-2 py-1 rounded-full border border-gray-100 flex items-center gap-1 group-hover:bg-orange-50 group-hover:text-primary transition-colors">
                    <span>{getIcon(category?.icone)}</span>
                    <span className="uppercase tracking-wider">{category?.nome}</span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-3 leading-snug group-hover:text-primary transition-colors">
                {question.pergunta}
            </h3>

            <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">
                {/* Strip HTML tags simplistically for preview if necessary, or just show text */}
                {question.resposta.replace(/<[^>]*>?/gm, '')}
            </p>

            <div className="flex items-center text-primary font-bold text-sm mt-auto">
                Ler resposta completa <ArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
    );
}
