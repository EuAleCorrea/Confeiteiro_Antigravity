"use client";

import { TicketMessage } from "@/lib/help-data-tickets";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Headset, FileText, Download } from "lucide-react";

interface TicketMessageItemProps {
    message: TicketMessage;
}

export default function TicketMessageItem({ message }: TicketMessageItemProps) {
    const isSupport = message.remetente.tipo === 'suporte';

    return (
        <div className={cn("flex gap-4 mb-6", isSupport ? "flex-row" : "flex-row-reverse")}>
            {/* Avatar */}
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                isSupport ? "bg-white border-border text-primary" : "bg-primary text-white border-primary"
            )}>
                {isSupport ? <Headset size={20} /> : <User size={20} />}
            </div>

            {/* Bubble */}
            <div className={cn(
                "max-w-[85%] rounded-2xl p-4 shadow-sm border",
                isSupport
                    ? "bg-white border-border rounded-tl-none"
                    : "bg-blue-50 border-blue-100 rounded-tr-none"
            )}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-text-primary">{message.remetente.nome}</span>
                    <span className="text-xs text-text-secondary">
                        {format(new Date(message.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                </div>

                {/* Content */}
                <div className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {message.conteudo}
                </div>

                {/* Attachments */}
                {message.anexos.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
                        {message.anexos.map((anexo, idx) => (
                            <a
                                key={idx}
                                href={anexo.url}
                                className="flex items-center gap-3 p-2 rounded-lg bg-black/5 hover:bg-black/10 transition-colors group"
                            >
                                <div className="bg-white p-1.5 rounded shadow-sm">
                                    <FileText size={16} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-text-primary truncate">{anexo.nome}</div>
                                    <div className="text-xs text-text-secondary">{Math.round(anexo.tamanho / 1024)} KB</div>
                                </div>
                                <Download size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

