"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { faqQuestions, helpCategories, FAQItem } from "@/lib/help-data";
import { cn } from "@/lib/utils";

export default function FAQDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [question, setQuestion] = useState<FAQItem | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

    useEffect(() => {
        if (!params?.id) return;
        const found = faqQuestions.find(q => q.id === params.id);
        if (found) {
            setQuestion(found);
        } else {
            // Handle not found simply
        }
    }, [params.id]);

    if (!question) {
        return <div className="p-12 text-center text-gray-500">Carregando pergunta...</div>;
    }

    const category = helpCategories.find(c => c.id === question.categoriaId);

    // Filter related questions (same category, excluding current)
    const relatedQuestions = faqQuestions
        .filter(q => q.categoriaId === question.categoriaId && q.id !== question.id)
        .slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                        <Link href="/ajuda" className="hover:text-primary"><Home size={16} /></Link>
                        <span>/</span>
                        <Link href="/ajuda/faq" className="hover:text-primary">FAQ</Link>
                        <span>/</span>
                        <span className="text-text-primary font-medium truncate">{question.pergunta}</span>
                    </div>

                    <Link
                        href="/ajuda/faq"
                        className="inline-flex items-center font-bold text-text-primary hover:text-primary transition-colors gap-2"
                    >
                        <ArrowLeft size={20} /> Voltar para perguntas
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Question Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                        <div className="p-8">
                            {/* Category Tag */}
                            <div className="mb-4">
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 uppercase tracking-wide">
                                    {category?.nome}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-text-primary mb-6 leading-tight">
                                {question.pergunta}
                            </h1>

                            <div className="prose prose-orange max-w-none text-text-secondary">
                                {/* Render simplistic HTML if strictly needed, otherwise text */}
                                {question.resposta.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">{paragraph}</p>
                                ))}
                            </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="bg-gray-50 p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="font-bold text-text-primary">Isso foi útil?</div>

                            {!feedbackGiven ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setFeedbackGiven('yes')}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                                    >
                                        <ThumbsUp size={18} /> Sim
                                    </button>
                                    <button
                                        onClick={() => setFeedbackGiven('no')}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-lg hover:border-red-500 hover:text-red-600 transition-all shadow-sm"
                                    >
                                        <ThumbsDown size={18} /> Não
                                    </button>
                                </div>
                            ) : (
                                <div className="text-green-600 font-medium animate-in fade-in">
                                    Obrigado pelo seu feedback! 🎉
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Still need help? */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Ainda precisa de ajuda?</h3>
                            <p className="text-sm text-blue-700">Nossa equipe de suporte está pronta para te atender.</p>
                        </div>
                        <Link
                            href="/ajuda/suporte"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"
                        >
                            <MessageSquare size={18} /> Falar com Suporte
                        </Link>
                    </div>

                </div>

                {/* Sidebar (Related) */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-sm text-text-primary mb-4 pb-2 border-b border-border">Relacionados</h3>
                        {relatedQuestions.length > 0 ? (
                            <div className="space-y-4">
                                {relatedQuestions.map(rel => (
                                    <Link
                                        key={rel.id}
                                        href={`/ajuda/faq/${rel.id}`}
                                        className="block group"
                                    >
                                        <h4 className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors mb-1">
                                            {rel.pergunta}
                                        </h4>
                                        <span className="text-xs text-text-secondary group-hover:underline">Ler artigo →</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-secondary">Nenhum artigo relacionado.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
