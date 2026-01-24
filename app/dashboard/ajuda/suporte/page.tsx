"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { mockTickets, SupportTicket, TicketStatus } from "@/lib/help-data-tickets";
import TicketCard from "@/components/ajuda/TicketCard";
import CreateTicketModal from "@/components/ajuda/CreateTicketModal"; // We will create this next
import { cn } from "@/lib/utils";

type FilterStatus = 'todos' | 'aberto' | 'em_analise' | 'resolvido';

export default function SupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('todos');
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Derived counts
    const counts = useMemo(() => {
        return {
            todos: tickets.length,
            aberto: tickets.filter(t => t.status === 'aberto' || t.status === 'aguardando_resposta').length,
            em_analise: tickets.filter(t => t.status === 'em_analise' || t.status === 'em_andamento').length,
            resolvido: tickets.filter(t => t.status === 'resolvido' || t.status === 'fechado').length
        };
    }, [tickets]);

    // Filtered list
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            // Status Filter Logic
            let statusMatch = true;
            if (filterStatus === 'aberto') statusMatch = ['aberto', 'aguardando_resposta'].includes(ticket.status);
            else if (filterStatus === 'em_analise') statusMatch = ['em_analise', 'em_andamento'].includes(ticket.status);
            else if (filterStatus === 'resolvido') statusMatch = ['resolvido', 'fechado'].includes(ticket.status);

            // Search Logic
            const searchMatch =
                ticket.assunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.numero.toString().includes(searchQuery);

            return statusMatch && searchMatch;
        });
    }, [tickets, filterStatus, searchQuery]);

    const handleCreateTicket = (newTicketData: Partial<SupportTicket>) => {
        // Mock ID generation
        const newTicket: SupportTicket = {
            ...newTicketData as SupportTicket,
            id: `t${Date.now()}`,
            numero: 1024 + tickets.length,
            usuarioId: 'u1',
            status: 'aberto',
            mensagens: [],
            anexos: [],
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };

        setTickets([newTicket, ...tickets]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-border sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/ajuda" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-text-secondary">
                                <ArrowLeft size={20} />
                            </Link>
                            <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                🎫 Meus Tickets
                            </h1>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm transition-colors"
                        >
                            <Plus size={18} />
                            Abrir Ticket
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="relative w-full md:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar tickets por assunto ou número..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 overflow-x-auto w-full pb-1 scrollbar-hide md:justify-end">
                            {[
                                { id: 'aberto', label: 'Abertos', color: 'text-orange-600 bg-orange-50 border-orange-200' },
                                { id: 'em_analise', label: 'Em Análise', color: 'text-blue-600 bg-blue-50 border-blue-200' },
                                { id: 'resolvido', label: 'Resolvidos', color: 'text-green-600 bg-green-50 border-green-200' },
                                { id: 'todos', label: 'Todos', color: 'text-gray-600 bg-gray-100 border-gray-200' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterStatus(tab.id as FilterStatus)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all flex items-center gap-2",
                                        filterStatus === tab.id
                                            ? `${tab.color} shadow-sm border-current`
                                            : "border-transparent text-text-secondary hover:bg-gray-100"
                                    )}
                                >
                                    {tab.label}
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-full",
                                        filterStatus === tab.id ? "bg-white/50" : "bg-gray-200"
                                    )}>
                                        {counts[tab.id as keyof typeof counts]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="max-w-5xl mx-auto px-4 py-8">
                {filteredTickets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTickets.map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-border dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-2">Nenhum ticket encontrado</h3>
                        <p className="text-text-secondary mb-6">
                            {filterStatus === 'todos'
                                ? "Você ainda não tem tickets de suporte."
                                : `Não há tickets com status "${filterStatus}".`}
                        </p>
                        {filterStatus !== 'todos' && (
                            <button
                                onClick={() => setFilterStatus('todos')}
                                className="text-primary font-medium hover:underline"
                            >
                                Ver todos os tickets
                            </button>
                        )}
                    </div>
                )}
            </div>

            <CreateTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTicket}
            />
        </div>
    );
}

