"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ArrowUpCircle, CheckCircle2, Clock, AlertTriangle, Check, DollarSign } from "lucide-react";
import { storage, ContaReceber, Pagamento } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { format, isAfter, startOfDay, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NewContaReceberModal } from "@/components/financeiro/NewContaReceberModal";
import { ReceivablePaymentModal } from "@/components/financeiro/ReceivablePaymentModal";

type TabType = 'pendentes' | 'recebidas' | 'atrasadas' | 'todas';

export default function ContasReceberPage() {
    const router = useRouter();
    const [contas, setContas] = useState<ContaReceber[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('pendentes');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago' | 'vencido'>('todos');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [paymentModal, setPaymentModal] = useState<{ open: boolean; conta: ContaReceber | null }>({ open: false, conta: null });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await supabaseStorage.getContasReceber();
            // Update status based on dates
            const today = startOfDay(new Date());
            const updated = data.map(c => {
                if (c.saldoRestante === 0) return { ...c, status: 'pago' as const };
                if (c.saldoRestante < c.valorTotal && c.saldoRestante > 0) return { ...c, status: 'parcial' as const };
                if (c.dataVencimento && isAfter(today, new Date(c.dataVencimento)) && c.status !== 'pago') return { ...c, status: 'atrasado' as const };
                if (c.status) return c;
                return { ...c, status: 'pendente' as const };
            });
            setContas(updated as ContaReceber[]);
        } catch (error) {
            console.error('Erro ao carregar contas a receber:', error);
        } finally {
            setLoading(false);
        }
    };

    // Summary calculations
    const summary = useMemo(() => {
        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const nextMonthStart = startOfMonth(addMonths(now, 1));
        const nextMonthEnd = endOfMonth(addMonths(now, 1));

        const thisMonthContas = contas.filter(c => {
            const venc = new Date(c.dataVencimento);
            return venc >= thisMonthStart && venc <= thisMonthEnd;
        });

        const nextMonthContas = contas.filter(c => {
            const venc = new Date(c.dataVencimento);
            return venc >= nextMonthStart && venc <= nextMonthEnd;
        });

        const pending = thisMonthContas.filter(c => c.status === 'pendente' || c.status === 'parcial');
        const received = thisMonthContas.filter(c => c.status === 'pago');
        const overdue = contas.filter(c => c.status === 'atrasado');

        return {
            total: contas.reduce((acc, c) => acc + c.valorTotal, 0),
            aReceber: pending.reduce((acc, c) => acc + c.saldoRestante, 0),
            recebido: received.reduce((acc, c) => acc + c.valorTotal, 0),
            pendente: contas.filter(c => c.status !== 'pago').reduce((acc, c) => acc + c.saldoRestante, 0)
        };
    }, [contas]);

    // Filter logic
    const filteredContas = useMemo(() => {
        let result = contas;

        // Filter by Status Dropdown
        if (statusFilter !== 'todos') {
            if (statusFilter === 'vencido') result = result.filter(c => c.status === 'atrasado');
            else result = result.filter(c => c.status === statusFilter || (statusFilter === 'pendente' && c.status === 'parcial'));
        }

        // Filter by Search Term
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.cliente.nome.toLowerCase().includes(q) ||
                c.descricao.toLowerCase().includes(q) ||
                (c.numeroOrcamento && c.numeroOrcamento.includes(q))
            );
        }

        return result.sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime());
    }, [contas, searchTerm, statusFilter]);

    const handlePayment = async (contaId: string, payment: Pagamento, lancadoFluxo: boolean) => {
        const contaIndex = contas.findIndex(c => c.id === contaId);
        if (contaIndex === -1) return;

        const conta = contas[contaIndex];
        const novoValorPago = conta.valorPago + payment.valor;
        const novoSaldo = conta.valorTotal - novoValorPago;
        const novoStatus = novoSaldo <= 0.01 ? 'pago' : 'parcial'; // Tolerance for float

        const updatedConta: ContaReceber = {
            ...conta,
            valorPago: novoValorPago,
            saldoRestante: novoSaldo > 0 ? novoSaldo : 0,
            status: novoStatus as any,
            pagamentos: [...conta.pagamentos, payment],
            atualizadoEm: new Date().toISOString()
        };

        try {
            await supabaseStorage.saveContaReceber(updatedConta);

            if (lancadoFluxo) {
                await supabaseStorage.saveTransacao({
                    id: crypto.randomUUID(),
                    tipo: 'Receita',
                    data: payment.data,
                    descricao: `Recebimento Parcial/Total: ${conta.cliente.nome} - ${conta.descricao}`,
                    valor: payment.valor,
                    categoriaId: '1', // Default category for now. TODO: Map categories properly
                    categoriaNome: conta.categoria,
                    status: 'Pago',
                    criadoEm: new Date().toISOString(),
                    observacoes: `Conta #${conta.id}`
                });
            }

            await loadData();
            setPaymentModal({ open: false, conta: null });
        } catch (error) {
            console.error("Erro ao salvar pagamento:", error);
            alert("Erro ao registrar pagamento.");
        }
    };

    const getStatusColor = (status: string, vencimento: string) => {
        if (status === 'pago') return 'bg-green-500';
        if (status === 'atrasado') return 'bg-red-500';
        return 'bg-secondary';
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Contas a Receber</h1>
                    <p className="text-neutral-500 mt-1">Gerencie os pagamentos pendentes de seus clientes</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push('/financeiro')}
                        className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        onClick={() => setIsNewModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-lg shadow-pink-200 transition-all translate-y-0 active:translate-y-0.5"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Conta
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total Geral</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-neutral-800">R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <p className="text-xs text-neutral-500">Valor total a receber</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Recebido</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-neutral-800">R$ {summary.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <p className="text-xs text-neutral-500">Já pago pelos clientes</p>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pendente</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-2xl font-bold text-neutral-800">R$ {summary.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <p className="text-xs text-neutral-500">Ainda a receber</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, descrição ou orçamento..."
                        className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
                    <select
                        className="px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-medium text-neutral-600"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                    >
                        <option value="todos">Todos Status</option>
                        <option value="pendente">Pendentes</option>
                        <option value="pago">Pagos</option>
                        <option value="vencido">Vencidos</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredContas.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 border-dashed">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-800 mb-1">Nenhuma conta encontrada</h3>
                        <p className="text-neutral-500">Tente ajustar os filtros ou adicione uma nova conta.</p>
                    </div>
                ) : (
                    filteredContas.map(conta => (
                        <div key={conta.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-2 h-2 rounded-full ${getStatusColor(conta.status, conta.dataVencimento)}`} />
                                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                            {conta.numeroOrcamento ? `Orçamento #${conta.numeroOrcamento}` : 'Conta Avulsa'}
                                        </span>
                                        <span className="text-xs text-neutral-400">•</span>
                                        <span className="text-xs font-medium text-neutral-500">{format(new Date(conta.dataVencimento), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-800 mb-1">{conta.descricao}</h3>
                                    <div className="flex items-center gap-2 text-neutral-600 mb-3">
                                        <span className="font-medium">{conta.cliente.nome}</span>
                                        {conta.cliente.telefone && (
                                            <>
                                                <span className="text-neutral-300">|</span>
                                                <span className="text-sm">{conta.cliente.telefone}</span>
                                            </>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="max-w-md w-full">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-green-600 font-medium">Pago: R$ {conta.valorPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            <span className="text-neutral-500 font-medium">Total: R$ {conta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                                style={{ width: `${(conta.valorPago / conta.valorTotal) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3 justify-between min-w-[150px]">
                                    <div className="text-right">
                                        <span className="text-xs text-neutral-400 block mb-1">Restante a Receber</span>
                                        <span className={`text-2xl font-bold ${conta.saldoRestante === 0 ? 'text-green-500' : 'text-neutral-800'}`}>
                                            R$ {conta.saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    {conta.saldoRestante > 0 && (
                                        <button
                                            onClick={() => setPaymentModal({ open: true, conta })}
                                            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            Receber
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            <NewContaReceberModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onSuccess={loadData}
            />

            {paymentModal.conta && paymentModal.open && (
                <ReceivablePaymentModal
                    conta={paymentModal.conta}
                    onClose={() => setPaymentModal({ open: false, conta: null })}
                    onSuccess={handlePayment}
                />
            )}
        </div>
    );
}

