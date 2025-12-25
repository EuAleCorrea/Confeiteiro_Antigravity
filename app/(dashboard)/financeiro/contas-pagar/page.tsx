"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, ArrowLeft, Check, Clock, AlertTriangle } from "lucide-react";
import { storage, ContaPagar, Pagamento } from "@/lib/storage";
import { format, isAfter, startOfDay, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Toggle } from "@/components/ui/Toggle";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type TabType = 'pendentes' | 'pagas' | 'vencidas' | 'todas';

export default function ContasPagarPage() {
    const [contas, setContas] = useState<ContaPagar[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>('pendentes');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const data = storage.getContasPagar();
        const today = startOfDay(new Date());
        const updated = data.map(c => {
            if (c.saldoRestante === 0) return { ...c, status: 'pago' as const };
            if (c.saldoRestante < c.valorTotal && c.saldoRestante > 0) return { ...c, status: 'parcial' as const };
            if (isAfter(today, new Date(c.dataVencimento))) return { ...c, status: 'vencido' as const };
            return { ...c, status: 'pendente' as const };
        });
        setContas(updated);
    };

    const filteredContas = useMemo(() => {
        let result = contas;

        if (activeTab === 'pendentes') result = result.filter(c => c.status === 'pendente' || c.status === 'parcial');
        else if (activeTab === 'pagas') result = result.filter(c => c.status === 'pago');
        else if (activeTab === 'vencidas') result = result.filter(c => c.status === 'vencido');

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.fornecedor.nome.toLowerCase().includes(q) ||
                c.descricao.toLowerCase().includes(q) ||
                c.numeroNF?.includes(q)
            );
        }

        return result;
    }, [contas, activeTab, searchQuery]);

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
        const paid = thisMonthContas.filter(c => c.status === 'pago');
        const overdue = contas.filter(c => c.status === 'vencido');

        return {
            aPagar: pending.reduce((acc, c) => acc + c.saldoRestante, 0),
            aPagarCount: pending.length,
            pago: paid.reduce((acc, c) => acc + c.valorTotal, 0),
            pagoCount: paid.length,
            vencido: overdue.reduce((acc, c) => acc + c.saldoRestante, 0),
            vencidoCount: overdue.length,
            previsto: nextMonthContas.reduce((acc, c) => acc + c.saldoRestante, 0),
            previstoCount: nextMonthContas.length
        };
    }, [contas]);

    const getStatusBadge = (status: ContaPagar['status']) => {
        switch (status) {
            case 'pago': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><Check className="w-3 h-3" /> Pago</span>;
            case 'pendente': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" /> Pendente</span>;
            case 'vencido': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3" /> Vencido</span>;
            case 'parcial': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Clock className="w-3 h-3" /> Parcial</span>;
        }
    };

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'pendentes', label: 'Pendentes', count: contas.filter(c => c.status === 'pendente' || c.status === 'parcial').length },
        { key: 'pagas', label: 'Pagas', count: contas.filter(c => c.status === 'pago').length },
        { key: 'vencidas', label: 'Vencidas', count: contas.filter(c => c.status === 'vencido').length },
        { key: 'todas', label: 'Todas', count: contas.length },
    ];

    const handleRegisterPayment = (conta: ContaPagar) => {
        setSelectedConta(conta);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = (contaId: string, payment: Pagamento, lancadoFluxo: boolean) => {
        const conta = contas.find(c => c.id === contaId);
        if (!conta) return;

        const newPagamentos = [...conta.pagamentos, payment];
        const newValorPago = conta.valorPago + payment.valor;
        const newSaldo = conta.valorTotal - newValorPago;

        const updatedConta: ContaPagar = {
            ...conta,
            pagamentos: newPagamentos,
            valorPago: newValorPago,
            saldoRestante: newSaldo,
            status: newSaldo === 0 ? 'pago' : 'parcial',
            lancadoFluxoCaixa: lancadoFluxo || conta.lancadoFluxoCaixa,
            atualizadoEm: new Date().toISOString()
        };

        storage.saveContaPagar(updatedConta);

        if (lancadoFluxo) {
            storage.saveTransacao({
                id: crypto.randomUUID(),
                tipo: 'Despesa',
                data: payment.data,
                descricao: `Pagamento: ${conta.fornecedor.nome} - ${conta.descricao}`,
                valor: payment.valor,
                categoriaId: '8',
                categoriaNome: conta.categoria || 'Insumos Gerais',
                status: 'Pago',
                criadoEm: new Date().toISOString()
            });
        }

        setShowPaymentModal(false);
        setSelectedConta(null);
        loadData();
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/financeiro" className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-800">💸 Contas a Pagar</h1>
                        <p className="text-sm text-neutral-500">Controle de pagamentos a fornecedores</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 w-48"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Nova Conta
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                    <p className="text-xs text-neutral-500 mb-1">A Pagar Este Mês</p>
                    <p className="text-xl font-bold text-neutral-800">R$ {summary.aPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-neutral-400">{summary.aPagarCount} contas</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                    <p className="text-xs text-neutral-500 mb-1">Pago Este Mês</p>
                    <p className="text-xl font-bold text-green-600">R$ {summary.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-neutral-400">{summary.pagoCount} contas</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                    <p className="text-xs text-neutral-500 mb-1">Vencido</p>
                    <p className="text-xl font-bold text-red-600">R$ {summary.vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-neutral-400">{summary.vencidoCount} contas</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm">
                    <p className="text-xs text-neutral-500 mb-1">Previsto Próx. Mês</p>
                    <p className="text-xl font-bold text-blue-600">R$ {summary.previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-neutral-400">{summary.previstoCount} contas</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-4 bg-neutral-100 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            activeTab === tab.key
                                ? "bg-white text-neutral-800 shadow-sm"
                                : "text-neutral-500 hover:text-neutral-700"
                        )}
                    >
                        {tab.label} <span className="text-xs text-neutral-400">({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Vencimento</th>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">NF</th>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Fornecedor</th>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Descrição</th>
                            <th className="text-left p-4 text-xs font-semibold text-neutral-500 uppercase">Categoria</th>
                            <th className="text-right p-4 text-xs font-semibold text-neutral-500 uppercase">Valor</th>
                            <th className="text-center p-4 text-xs font-semibold text-neutral-500 uppercase">Status</th>
                            <th className="text-center p-4 text-xs font-semibold text-neutral-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredContas.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-neutral-400">
                                    Nenhuma conta encontrada
                                </td>
                            </tr>
                        ) : (
                            filteredContas.map(conta => (
                                <tr key={conta.id} className={cn(
                                    "border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors",
                                    conta.status === 'pago' && "bg-green-50/30",
                                    conta.status === 'vencido' && "bg-red-50/30"
                                )}>
                                    <td className="p-4 text-sm text-neutral-600">{format(new Date(conta.dataVencimento), 'dd/MM')}</td>
                                    <td className="p-4 text-sm font-mono text-neutral-500">{conta.numeroNF || '-'}</td>
                                    <td className="p-4 text-sm font-medium text-neutral-800">{conta.fornecedor.nome}</td>
                                    <td className="p-4 text-sm text-neutral-600 max-w-[180px] truncate">{conta.descricao}</td>
                                    <td className="p-4 text-sm text-neutral-500">{conta.categoria}</td>
                                    <td className="p-4 text-sm font-bold text-neutral-800 text-right">
                                        R$ {conta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        {conta.saldoRestante !== conta.valorTotal && conta.saldoRestante > 0 && (
                                            <div className="text-xs text-neutral-400 font-normal">
                                                Saldo: R$ {conta.saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">{getStatusBadge(conta.status)}</td>
                                    <td className="p-4 text-center">
                                        <div className="relative group">
                                            <button className="p-2 hover:bg-neutral-100 rounded-full">
                                                <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                                            </button>
                                            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-neutral-100 py-1 min-w-[180px] hidden group-hover:block z-10">
                                                {conta.status !== 'pago' && (
                                                    <button
                                                        onClick={() => handleRegisterPayment(conta)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2"
                                                    >
                                                        💸 Registrar Pagamento
                                                    </button>
                                                )}
                                                <button className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2">
                                                    📄 Ver Detalhes
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Excluir esta conta?')) {
                                                            storage.deleteContaPagar(conta.id);
                                                            loadData();
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Account Modal */}
            {showNewModal && (
                <NewContaPagarModal
                    onClose={() => setShowNewModal(false)}
                    onSuccess={() => { setShowNewModal(false); loadData(); }}
                />
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedConta && (
                <PaymentModal
                    conta={selectedConta}
                    onClose={() => { setShowPaymentModal(false); setSelectedConta(null); }}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

// --- New Account Modal ---
function NewContaPagarModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        fornecedorNome: '',
        numeroNF: '',
        categoria: 'Ingredientes',
        descricao: '',
        valorTotal: '',
        dataEmissao: format(new Date(), 'yyyy-MM-dd'),
        dataVencimento: format(new Date(), 'yyyy-MM-dd'),
        observacoes: '',
        marcarPago: false,
        dataPagamento: format(new Date(), 'yyyy-MM-dd'),
        formaPagamento: 'PIX' as Pagamento['formaPagamento'],
        lancarFluxo: true
    });

    const categorias = ['Ingredientes', 'Embalagens', 'Aluguel', 'Utilities', 'Impostos', 'Salários', 'Manutenção', 'Marketing', 'Outras'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valorTotal.replace(',', '.')) || 0;
        const now = new Date().toISOString();

        const novaConta: ContaPagar = {
            id: crypto.randomUUID(),
            numeroNF: formData.numeroNF || undefined,
            fornecedor: { nome: formData.fornecedorNome },
            categoria: formData.categoria,
            descricao: formData.descricao,
            valorTotal: valor,
            valorPago: formData.marcarPago ? valor : 0,
            saldoRestante: formData.marcarPago ? 0 : valor,
            dataEmissao: formData.dataEmissao,
            dataVencimento: formData.dataVencimento,
            status: formData.marcarPago ? 'pago' : 'pendente',
            pagamentos: formData.marcarPago ? [{
                id: crypto.randomUUID(),
                data: formData.dataPagamento,
                valor: valor,
                formaPagamento: formData.formaPagamento
            }] : [],
            lancadoFluxoCaixa: formData.marcarPago && formData.lancarFluxo,
            observacoes: formData.observacoes,
            criadoEm: now,
            atualizadoEm: now
        };

        storage.saveContaPagar(novaConta);

        if (formData.marcarPago && formData.lancarFluxo) {
            storage.saveTransacao({
                id: crypto.randomUUID(),
                tipo: 'Despesa',
                data: formData.dataPagamento,
                descricao: `Pagamento: ${formData.fornecedorNome} - ${formData.descricao}`,
                valor: valor,
                categoriaId: '8',
                categoriaNome: formData.categoria,
                status: 'Pago',
                criadoEm: now
            });
        }

        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-neutral-100 sticky top-0 bg-white">
                    <h2 className="text-xl font-bold text-neutral-800">Nova Conta a Pagar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-neutral-700">Fornecedor *</label>
                            <input
                                type="text" required
                                placeholder="Nome do fornecedor"
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                                value={formData.fornecedorNome}
                                onChange={e => setFormData({ ...formData, fornecedorNome: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Nº NF</label>
                            <input
                                type="text"
                                placeholder="Ex: 123456"
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                value={formData.numeroNF}
                                onChange={e => setFormData({ ...formData, numeroNF: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Categoria *</label>
                            <select
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                value={formData.categoria}
                                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                            >
                                {categorias.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-neutral-700">Descrição *</label>
                            <input
                                type="text" required
                                placeholder="Ex: Compra de farinha 50kg"
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                value={formData.descricao}
                                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Valor Total *</label>
                            <input
                                type="number" step="0.01" required
                                placeholder="0,00"
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-lg font-bold"
                                value={formData.valorTotal}
                                onChange={e => setFormData({ ...formData, valorTotal: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Vencimento *</label>
                            <input
                                type="date" required
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                value={formData.dataVencimento}
                                onChange={e => setFormData({ ...formData, dataVencimento: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t border-neutral-100 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-neutral-700">Marcar como pago agora</span>
                            <Toggle
                                checked={formData.marcarPago}
                                onChange={(checked) => setFormData({ ...formData, marcarPago: checked })}
                                size="sm"
                            />
                        </div>

                        {formData.marcarPago && (
                            <div className="mt-4 p-4 bg-green-50 rounded-xl space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-neutral-600">Data Pagamento</label>
                                        <input
                                            type="date"
                                            className="w-full mt-1 p-2 bg-white border border-neutral-200 rounded-lg text-sm"
                                            value={formData.dataPagamento}
                                            onChange={e => setFormData({ ...formData, dataPagamento: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-neutral-600">Forma Pagamento</label>
                                        <select
                                            className="w-full mt-1 p-2 bg-white border border-neutral-200 rounded-lg text-sm"
                                            value={formData.formaPagamento}
                                            onChange={e => setFormData({ ...formData, formaPagamento: e.target.value as Pagamento['formaPagamento'] })}
                                        >
                                            <option>PIX</option>
                                            <option>Dinheiro</option>
                                            <option>Boleto</option>
                                            <option>Cartão Crédito</option>
                                            <option>Transferência</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <Toggle
                                        checked={formData.lancarFluxo}
                                        onChange={(checked) => setFormData({ ...formData, lancarFluxo: checked })}
                                        size="sm"
                                    />
                                    <span className="text-sm">Lançar no Fluxo de Caixa</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button type="button" onClick={onClose} className="w-full py-3 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl hover:bg-neutral-50">
                            Cancelar
                        </button>
                        <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700">
                            Salvar Conta
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}

// --- Payment Modal ---
function PaymentModal({ conta, onClose, onSuccess }: { conta: ContaPagar; onClose: () => void; onSuccess: (contaId: string, payment: Pagamento, lancadoFluxo: boolean) => void }) {
    const [formData, setFormData] = useState({
        dataPagamento: format(new Date(), 'yyyy-MM-dd'),
        valorPago: conta.saldoRestante.toString(),
        formaPagamento: 'PIX' as Pagamento['formaPagamento'],
        observacoes: '',
        lancarFluxo: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valorPago.replace(',', '.')) || 0;

        const payment: Pagamento = {
            id: crypto.randomUUID(),
            data: formData.dataPagamento,
            valor: valor,
            formaPagamento: formData.formaPagamento,
            observacoes: formData.observacoes
        };

        onSuccess(conta.id, payment, formData.lancarFluxo);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                    <h2 className="text-xl font-bold text-neutral-800">Registrar Pagamento</h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">✕</button>
                </div>

                <div className="p-6 border-b border-neutral-100 bg-neutral-50">
                    <p className="text-sm text-neutral-500">Conta: <span className="font-medium text-neutral-800">#{conta.numeroNF || conta.id.slice(0, 8)} - {conta.fornecedor.nome}</span></p>
                    <p className="text-sm text-neutral-500">Descrição: <span className="text-neutral-700">{conta.descricao}</span></p>
                    <p className="text-sm text-neutral-500">Valor Total: <span className="font-bold text-neutral-800">R$ {conta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                    <p className="text-sm text-neutral-500">Saldo Restante: <span className="font-bold text-red-600">R$ {conta.saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Data Pagamento *</label>
                            <input
                                type="date" required
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                                value={formData.dataPagamento}
                                onChange={e => setFormData({ ...formData, dataPagamento: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700">Valor Pago *</label>
                            <input
                                type="number" step="0.01" required
                                className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-lg font-bold"
                                value={formData.valorPago}
                                onChange={e => setFormData({ ...formData, valorPago: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-neutral-700">Forma de Pagamento *</label>
                        <select
                            className="w-full mt-1 p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                            value={formData.formaPagamento}
                            onChange={e => setFormData({ ...formData, formaPagamento: e.target.value as Pagamento['formaPagamento'] })}
                        >
                            <option>PIX</option>
                            <option>Dinheiro</option>
                            <option>Boleto</option>
                            <option>Cartão Crédito</option>
                            <option>Transferência</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <Toggle
                            checked={formData.lancarFluxo}
                            onChange={(checked) => setFormData({ ...formData, lancarFluxo: checked })}
                            size="sm"
                        />
                        <span className="text-sm text-neutral-700">Lançar despesa no Fluxo de Caixa</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button type="button" onClick={onClose} className="w-full py-3 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl hover:bg-neutral-50">
                            Cancelar
                        </button>
                        <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700">
                            Confirmar Pagamento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
