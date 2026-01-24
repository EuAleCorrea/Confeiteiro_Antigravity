"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, Video, MessageCircle } from "lucide-react";
import { buscarConteudo, FAQQuestion } from "@/lib/help-data";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HelpSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ faq: FAQQuestion[], total: number }>({ faq: [], total: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (query.length > 2) {
            const searchResults = buscarConteudo(query);
            setResults(searchResults);
            setIsOpen(true);
        } else {
            setResults({ faq: [], total: 0 });
            setIsOpen(false);
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const getIconForType = (type: string) => {
        // For now we only have FAQs, but logic is ready for articles/videos
        switch (type) {
            case 'video': return <Video size={16} />;
            case 'article': return <FileText size={16} />;
            default: return <MessageCircle size={16} />;
        }
    };

    return (
        <div className="relative w-full max-w-[600px]" ref={wrapperRef}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    className="w-full h-14 pl-12 pr-4 rounded-full border-2 border-border focus:border-primary focus:outline-none shadow-sm transition-all"
                    placeholder="Buscar na base de conhecimento..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                />
            </div>

            {isOpen && results.total > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-50">
                    <div className="p-3 bg-gray-50 border-b border-border">
                        <p className="text-sm text-text-secondary">
                            Resultados para: <span className="font-semibold text-text-primary">"{query}"</span>
                        </p>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {results.faq.length > 0 && (
                            <div className="p-2">
                                <h6 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    FAQ ({results.faq.length})
                                </h6>
                                {results.faq.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => router.push(`/dashboard/ajuda/faq?id=${item.id}&categoria=${item.categoriaId}`)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <div className="text-primary">
                                            {getIconForType('faq')}
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary text-sm">{item.pergunta}</p>
                                            <p className="text-xs text-text-secondary mt-0.5">
                                                {item.categoriaId.charAt(0).toUpperCase() + item.categoriaId.slice(1)} • {item.visualizacoes} visualizações
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Placeholders for Articles and Videos if implemented later */}
                    </div>

                    <div className="p-3 border-t border-border bg-gray-50 text-center">
                        <Link href={`/dashboard/ajuda/faq?q=${encodeURIComponent(query)}`} className="text-sm text-primary hover:underline font-medium">
                            Ver todos os resultados
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

