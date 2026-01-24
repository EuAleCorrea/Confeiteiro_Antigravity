"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import FAQCard from "@/components/ajuda/FAQCard";
import { helpCategories, faqQuestions } from "@/lib/help-data";
import { cn } from "@/lib/utils";

function FAQContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // URL params
    const categoryParam = searchParams.get('categoria') || 'todas';
    const queryParam = searchParams.get('q') || '';

    // Local state for search input
    const [searchTerm, setSearchTerm] = useState(queryParam);

    // Sync local state if URL changes
    useEffect(() => {
        setSearchTerm(queryParam);
    }, [queryParam]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
    };

    // Filter Logic
    const filteredQuestions = useMemo(() => {
        let result = faqQuestions;

        // 1. Filter by Category
        if (categoryParam !== 'todas') {
            result = result.filter(q => q.categoriaId === categoryParam);
        }

        // 2. Filter by Search Term (Local)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.pergunta.toLowerCase().includes(term) ||
                p.resposta.toLowerCase().includes(term) ||
                p.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }

        return result;
    }, [categoryParam, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                            ❓ Perguntas Frequentes
                        </h1>
                        <Link
                            href="/dashboard/ajuda"
                            className="text-text-secondary hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} /> Voltar
                        </Link>
                    </div>

                    {/* Search inside FAQ */}
                    <div className="relative mb-6 max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-full border border-border focus:border-primary focus:outline-none bg-gray-50 focus:bg-white transition-all shadow-sm"
                            placeholder="Buscar pergunta específica..."
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
                        <button
                            onClick={() => router.push('/dashboard/ajuda/faq?categoria=todas')}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                categoryParam === 'todas'
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            )}
                        >
                            Todas
                        </button>
                        {helpCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => router.push(`/dashboard/ajuda/faq?categoria=${cat.id}`)}
                                className={cn(
                                    "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                    categoryParam === cat.id
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                )}
                            >
                                {cat.nome}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {filteredQuestions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-text-primary">Nenhum resultado encontrado</h3>
                        <p className="text-text-secondary">Tente buscar por outros termos ou visualizar todas as categorias.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                router.push('/dashboard/ajuda/faq?categoria=todas');
                            }}
                            className="mt-4 text-primary font-medium hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {filteredQuestions.map(question => (
                            <FAQCard key={question.id} question={question} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FAQPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
            <FAQContent />
        </Suspense>
    );
}

