"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Eye } from "lucide-react";
import { FAQQuestion } from "@/lib/help-data";
import FeedbackControl from "./FeedbackControl";

interface FAQAccordionProps {
    questions: FAQQuestion[];
    defaultOpenId?: string | null;
}

export default function FAQAccordion({ questions, defaultOpenId }: FAQAccordionProps) {
    const [openId, setOpenId] = useState<string | null>(defaultOpenId || null);

    useEffect(() => {
        if (defaultOpenId) {
            setOpenId(defaultOpenId);
            // Scroll to element? Maybe.
            const el = document.getElementById(`faq-${defaultOpenId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [defaultOpenId]);

    const toggle = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="space-y-4">
            {questions.map((q) => {
                const isOpen = openId === q.id;

                return (
                    <div
                        key={q.id}
                        id={`faq-${q.id}`}
                        className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "border-primary shadow-sm" : "border-border hover:border-gray-300"
                            }`}
                    >
                        <button
                            onClick={() => toggle(q.id)}
                            className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                        >
                            <span className={`font-semibold text-lg ${isOpen ? "text-primary" : "text-text-primary"}`}>
                                {q.pergunta}
                            </span>
                            <div className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}>
                                <ChevronRight size={20} className={isOpen ? "text-primary" : "text-gray-400"} />
                            </div>
                        </button>

                        <div
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="p-4 pt-0 border-t border-transparent">
                                <div className="text-text-secondary whitespace-pre-line leading-relaxed pb-4">
                                    {q.resposta}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                    <Eye size={12} />
                                    <span>{q.visualizacoes} visualizações</span>
                                </div>

                                <FeedbackControl questionId={q.id} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
