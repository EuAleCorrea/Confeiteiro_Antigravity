"use client";

import { useEffect, useState } from "react";
import { storage, Pedido } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar as CalendarIcon, List as ListIcon, Kanban as KanbanIcon, LayoutGrid, Plus, Filter, Search } from "lucide-react";
import { ListView } from "@/components/pedidos/views/ListView";
import { KanbanView } from "@/components/pedidos/views/KanbanView";
import { CalendarView } from "@/components/pedidos/views/CalendarView";
import { WeeklyView } from "@/components/pedidos/views/WeeklyView";
import { Dialog } from "@/components/ui/Dialog";
import { OrderForm } from "@/components/pedidos/OrderForm";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [view, setView] = useState<'list' | 'kanban' | 'calendar' | 'weekly'>('kanban');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadPedidos();
    }, []);

    const loadPedidos = () => {
        const list = storage.getPedidos();
        // Sort by delivery date asc by default
        list.sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime());
        setPedidos(list);
    };

    const handleStatusChange = (pedidoId: string, newStatus: Pedido['status']) => {
        const pedido = storage.getPedidoById(pedidoId);
        if (pedido) {
            const updated = { ...pedido, status: newStatus };
            // Add history log
            updated.historico.push({
                data: new Date().toISOString(),
                acao: `Status alterado para ${newStatus} (Kanban)`,
                usuario: 'Admin'
            });
            storage.savePedido(updated);
            loadPedidos(); // Refresh
        }
    };

    // Filter Logic
    const filteredPedidos = pedidos.filter(p => {
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        const matchesSearch = p.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.numero.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    // Stats Calculation
    const stats = {
        today: pedidos.filter(p => new Date(p.dataEntrega).toDateString() === new Date().toDateString()).length,
        week: pedidos.filter(p => {
            const date = new Date(p.dataEntrega);
            const now = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(now.getDate() + 7);
            return date >= now && date <= nextWeek;
        }).length,
        production: pedidos.filter(p => p.status === 'Em Produção').length,
        pending: pedidos.filter(p => p.status === 'Pagamento Pendente' || p.status === 'Aguardando Produção').length
    };


    const handlePaymentConfirm = (pedidoId: string) => {
        if (!confirm("Confirmar recebimento do pagamento?")) return;

        const pedido = storage.getPedidoById(pedidoId);
        if (pedido) {
            const updated = {
                ...pedido,
                financeiro: {
                    ...pedido.financeiro,
                    statusPagamento: 'Pago' as const,
                    valorPago: pedido.financeiro.valorTotal,
                    saldoPendente: 0
                },
                // Optional: Auto-advance status if it was Payment Pending
                status: pedido.status === 'Pagamento Pendente' ? 'Aguardando Produção' : pedido.status,
                historico: [
                    ...pedido.historico,
                    {
                        data: new Date().toISOString(),
                        acao: 'Pagamento Confirmado',
                        usuario: 'Admin'
                    }
                ]
            };

            storage.savePedido(updated);
            loadPedidos();
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* ... Header & Stats (unchanged) ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Pedidos</h1>
                    <p className="text-text-secondary">Gerencie produção, entregas e status</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <Input
                            placeholder="Buscar cliente ou nº..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Novo Pedido
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-orange-600 uppercase">Hoje</p>
                        <p className="text-2xl font-bold text-neutral-800">{stats.today}</p>
                        <p className="text-xs text-neutral-500">pedidos para entrega</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-neutral-600 uppercase">Próx. 7 Dias</p>
                        <p className="text-2xl font-bold text-neutral-800">{stats.week}</p>
                        <p className="text-xs text-neutral-500">pedidos na agenda</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-blue-600 uppercase">Em Produção</p>
                        <p className="text-2xl font-bold text-neutral-800">{stats.production}</p>
                        <p className="text-xs text-neutral-500">na cozinha agora</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs font-semibold text-red-600 uppercase">Pendentes</p>
                        <p className="text-2xl font-bold text-neutral-800">{stats.pending}</p>
                        <p className="text-xs text-neutral-500">pagto ou produção</p>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-2 rounded-lg border border-border">
                {/* View Switcher */}
                <div className="flex bg-neutral-100 p-1 rounded-md w-full md:w-auto">
                    <button
                        onClick={() => setView('weekly')}
                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'weekly' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <LayoutGrid size={16} className="mr-2" /> Agenda
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <CalendarIcon size={16} className="mr-2" /> Mês
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <ListIcon size={16} className="mr-2" /> Lista
                    </button>
                    <button
                        onClick={() => setView('kanban')}
                        className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                    >
                        <KanbanIcon size={16} className="mr-2" /> Kanban
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={16} className="text-neutral-400" />
                    <select
                        className="bg-transparent text-sm border-none focus:ring-0 text-neutral-700 font-medium"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="Pagamento Pendente">Pagamento Pendente</option>
                        <option value="Aguardando Produção">Aguardando Produção</option>
                        <option value="Em Produção">Em Produção</option>
                        <option value="Pronto">Pronto</option>
                        <option value="Saiu para Entrega">Saiu para Entrega</option>
                    </select>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {view === 'list' && <ListView pedidos={filteredPedidos} onPaymentConfirm={handlePaymentConfirm} />}
                {view === 'kanban' && <KanbanView pedidos={filteredPedidos} onStatusChange={handleStatusChange} onPaymentConfirm={handlePaymentConfirm} />}
                {view === 'calendar' && <CalendarView pedidos={filteredPedidos} />}
                {view === 'weekly' && <WeeklyView pedidos={filteredPedidos} />}
            </div>

            <Dialog
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Novo Pedido"
                className="max-w-4xl"
            >
                <OrderForm
                    onClose={() => setIsModalOpen(false)}
                    onSave={() => {
                        setIsModalOpen(false);
                        loadPedidos();
                    }}
                />
            </Dialog>
        </div >
    );
}
