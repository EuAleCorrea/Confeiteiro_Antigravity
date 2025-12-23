"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Paperclip, Send, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import { mockTickets, SupportTicket, TicketStatus, getStatusColorSpec, getStatusLabel, getPriorityLabel, TicketMessage } from "@/lib/help-data-tickets";
import { helpCategories } from "@/lib/help-data";
import TicketMessageItem from "@/components/ajuda/TicketMessageItem";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function TicketDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [replyText, setReplyText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!params?.id) return;

        // Mock fetching ticket
        const found = mockTickets.find(t => t.id === params.id);
        if (found) {
            setTicket(found);
        } else {
            if (params.id.toString().startsWith('t')) {
                // Simulate finding the "newly created" ticket
                const newTicket: SupportTicket = {
                    id: params.id as string,
                    numero: 1024,
                    usuarioId: 'u1',
                    tipo: 'duvida',
                    categoriaId: 'financeiro',
                    assunto: 'Novo Ticket Criado (Simulado)',
                    descricao: 'Este é um ticket simulado que você acabou de criar de forma temporária.',
                    prioridade: 'media',
                    status: 'aberto',
                    mensagens: [],
                    anexos: [],
                    criadoEm: new Date().toISOString(),
                    atualizadoEm: new Date().toISOString()
                };
                setTicket(newTicket);
            }
        }
    }, [params.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.mensagens]);

    if (!ticket) {
        return <div className="p-8 text-center text-gray-500">Carregando ticket...</div>;
    }

    const category = helpCategories.find(c => c.id === ticket.categoriaId);

    const handleSendMessage = async () => {
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const newMessage: TicketMessage = {
            id: `m${Date.now()}`,
            remetente: { tipo: 'usuario', nome: 'Você' }, // Current user
            conteudo: replyText,
            anexos: [],
            criadoEm: new Date().toISOString()
        };

        setTicket(prev => prev ? ({
            ...prev,
            mensagens: [...prev.mensagens, newMessage],
            atualizadoEm: new Date().toISOString(),
            status: prev.status === 'resolvido' ? 'em_analise' : prev.status // Reopen if resolved
        }) : null);

        setReplyText("");
        setIsSubmitting(false);

        // Auto-reply simulation
        setTimeout(() => {
            const autoReply: TicketMessage = {
                id: `m${Date.now()}+1`,
                remetente: { tipo: 'suporte', nome: 'Bot de Suporte' },
                conteudo: 'Recebemos sua mensagem! Um atendente humano responderá em breve.',
                anexos: [],
                criadoEm: new Date().toISOString()
            };
            setTicket(prev => prev ? ({
                ...prev,
                mensagens: [...prev.mensagens, autoReply]
            }) : null);
        }, 3000);
    };

    const handleStatusChange = (newStatus: TicketStatus) => {
        setTicket(prev => prev ? ({ ...prev, status: newStatus }) : null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link href="/ajuda/suporte" className="inline-flex items-center text-text-secondary hover:text-primary mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Voltar para tickets
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-xl font-bold text-text-primary">Ticket #{ticket.numero}</h1>
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", getStatusColorSpec(ticket.status))}>
                                    {getStatusLabel(ticket.status)}
                                </span>
                            </div>
                            <h2 className="text-lg text-text-primary font-medium">{ticket.assunto}</h2>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                            <div className="flex flex-col items-end">
                                <span>Criado em {format(new Date(ticket.criadoEm), "dd/MM/yyyy HH:mm")}</span>
                                <span>Última atualização: {format(new Date(ticket.atualizadoEm), "dd/MM/yyyy HH:mm")}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content (Left Col) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Original Request (Description) */}
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <User size={16} />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-text-primary">Você (Descrição Original)</div>
                            </div>
                        </div>
                        <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                            {ticket.descricao}
                        </div>
                    </div>

                    {/* Timeline / Messages */}
                    <div className="relative">
                        {ticket.mensagens.length > 0 && (
                            <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 -z-10" />
                        )}

                        {ticket.mensagens.map((msg) => (
                            <TicketMessageItem key={msg.id} message={msg} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Box */}
                    {['resolvido', 'cancelado', 'fechado'].includes(ticket.status) ? (
                        <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 text-center">
                            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                            <h3 className="font-bold text-text-primary">Este ticket está resolvido/fechado</h3>
                            <p className="text-sm text-text-secondary mb-4">Para continuar o atendimento, você precisa reabrir o ticket.</p>
                            <button
                                onClick={() => handleStatusChange('em_analise')}
                                className="text-primary font-bold hover:underline"
                            >
                                Reabrir Ticket
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-xl border border-border shadow-sm">
                            <h3 className="font-bold text-sm text-text-primary mb-3">Responder</h3>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Digite sua resposta..."
                                className="w-full p-3 rounded-lg border border-border min-h-[120px] focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y"
                            />
                            <div className="flex justify-between items-center mt-3">
                                <button className="text-gray-400 hover:text-gray-600 p-2 rounded hover:bg-gray-100 transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!replyText.trim() || isSubmitting}
                                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Enviando...' : (
                                        <>Enviar Resposta <Send size={16} /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Sidebar Info (Right Col) */}
                <div className="space-y-6">
                    {/* Ticket Info Box */}
                    <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-sm text-text-primary mb-4 pb-2 border-b border-border">Informações</h3>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-text-secondary block mb-1">Status</span>
                                <span className={cn("px-2 py-0.5 rounded text-xs font-bold border", getStatusColorSpec(ticket.status))}>
                                    {getStatusLabel(ticket.status)}
                                </span>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-text-secondary block mb-1">Prioridade</span>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full",
                                        ticket.prioridade === 'alta' || ticket.prioridade === 'urgente' ? 'bg-red-500' : 'bg-green-500'
                                    )} />
                                    <span className="text-sm text-text-primary capitalize">{getPriorityLabel(ticket.prioridade)}</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-text-secondary block mb-1">Categoria</span>
                                <div className="text-sm text-text-primary capitalize">{category?.nome || ticket.categoriaId}</div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-text-secondary block mb-1">Tipo</span>
                                <div className="text-sm text-text-primary capitalize">{ticket.tipo}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Box */}
                    <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                        <h3 className="font-bold text-sm text-text-primary mb-4 pb-2 border-b border-border">Ações</h3>

                        <div className="space-y-2">
                            {ticket.status !== 'resolvido' && ticket.status !== 'fechado' && ticket.status !== 'cancelado' && (
                                <button
                                    onClick={() => handleStatusChange('resolvido')}
                                    className="w-full py-2 px-3 bg-green-50 text-green-700 font-bold text-sm rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={16} /> Marcar como Resolvido
                                </button>
                            )}

                            {ticket.status !== 'cancelado' && ticket.status !== 'resolvido' && (
                                <button
                                    onClick={() => handleStatusChange('cancelado')}
                                    className="w-full py-2 px-3 bg-gray-50 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Cancelar Ticket
                                </button>
                            )}

                            {(ticket.status === 'resolvido' || ticket.status === 'cancelado') && (
                                <div className="text-center text-xs text-gray-500 italic mt-2">
                                    Nenhuma ação disponível
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
