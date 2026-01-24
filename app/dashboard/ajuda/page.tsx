"use client";

import { useMemo } from "react";
import Link from "next/link";
import { MessageCircle, Video, Ticket, BookOpen, Search, ArrowRight } from "lucide-react";
import HelpSearch from "@/components/ajuda/HelpSearch";
import { helpCategories, FAQQuestion, faqQuestions } from "@/lib/help-data";
import * as LucideIcons from "lucide-react";

export default function HelpCenterPage() {
    // Dynamic Icon component
    const IconComponent = ({ name, size = 24, className }: { name: string, size?: number, className?: string }) => {
        // @ts-ignore
        const Icon = LucideIcons[name];
        return Icon ? <Icon size={size} className={className} /> : null;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Hero Section */}
            <div className="bg-white border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-text-primary mb-4 flex items-center justify-center gap-2">
                            🎓 Como podemos ajudar você?
                        </h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Digite sua dúvida abaixo ou navegue pelas categorias para encontrar o que precisa.
                        </p>
                    </div>

                    <HelpSearch />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header: Central de Ajuda */}
                <div className="mb-8 p-4 bg-white rounded-lg border border-border shadow-sm flex items-center gap-3">
                    <span className="text-2xl">💡</span>
                    <h2 className="text-xl font-bold text-text-primary">Central de Ajuda</h2>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Card 1: FAQ */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-md transition-all flex flex-col items-center text-center group">
                        <div className="mb-4 p-3 bg-blue-50 rounded-full text-blue-500 group-hover:scale-110 transition-transform">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">FAQ</h3>
                        <p className="text-sm text-text-secondary mb-4">Perguntas frequentes e respostas rápidas.</p>
                        <Link href="/ajuda/faq" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            Acessar <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Card 2: Videos */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-md transition-all flex flex-col items-center text-center group">
                        <div className="mb-4 p-3 bg-red-50 rounded-full text-red-500 group-hover:scale-110 transition-transform">
                            <Video size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Vídeos</h3>
                        <p className="text-sm text-text-secondary mb-4">Tutoriais em vídeo passo a passo.</p>
                        <Link href="/ajuda/videos" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            Assistir <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Card 3: Support */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-md transition-all flex flex-col items-center text-center group">
                        <div className="mb-4 p-3 bg-green-50 rounded-full text-green-500 group-hover:scale-110 transition-transform">
                            <Ticket size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Suporte</h3>
                        <p className="text-sm text-text-secondary mb-4">Abra um ticket para nossa equipe.</p>
                        <Link href="/ajuda/suporte" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            Contatar <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Card 4: Guides */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-md transition-all flex flex-col items-center text-center group">
                        <div className="mb-4 p-3 bg-purple-50 rounded-full text-purple-500 group-hover:scale-110 transition-transform">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Guias</h3>
                        <p className="text-sm text-text-secondary mb-4">Manuais completos do sistema.</p>
                        <button className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all opacity-50 cursor-not-allowed" title="Em breve">
                            Ler <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                        📂 Explore por Categoria
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {helpCategories.map((category) => (
                            <Link
                                href={`/ajuda/faq?categoria=${category.id}`}
                                key={category.id}
                                className="group bg-white p-5 rounded-xl border border-border hover:border-primary transition-all flex items-start gap-4 hover:shadow-sm"
                            >
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-600 group-hover:bg-orange-50 group-hover:text-primary transition-colors">
                                    <IconComponent name={category.icone} size={28} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                                        {category.nome}
                                    </h4>
                                    <p className="text-sm text-text-secondary mt-1">
                                        {category.totalArtigos} artigos
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

