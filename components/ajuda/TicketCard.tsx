"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Clock } from "lucide-react";
import { SupportTicket, getStatusColorSpec, getStatusLabel } from "@/lib/help-data-tickets";
import { helpCategories } from "@/lib/help-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketCardProps {
    ticket: SupportTicket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
    const category = helpCategories.find(c => c.id === ticket.categoriaId);

    return (
        <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow relative group">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-text-secondary bg-gray-100 px-2 py-0.5 rounded">
                    #{ticket.numero}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusColorSpec(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                </span>
            </div>

            <h3 className="font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {ticket.assunto}
            </h3>

            <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
                <span className="flex items-center gap-1">
                    {category?.icone && <span>{/* Here we would need the Icon component, but simplifying */}📂</span>}
                    {category?.nome || ticket.categoriaId}
                </span>
                <span>•</span>
                <span>{ticket.tipo.charAt(0).toUpperCase() + ticket.tipo.slice(1)}</span>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                <div className="text-xs text-text-secondary flex flex-col gap-1">
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        Criado em {format(new Date(ticket.criadoEm), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                    {ticket.mensagens.length > 0 && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                            <MessageSquare size={12} />
                            {ticket.mensagens.length} novas mensagens
                        </span>
                    )}
                </div>

                <Link
                    href={`/ajuda/suporte/${ticket.id}`}
                    className="text-sm font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                >
                    Ver Detalhes <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
}
