
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { storage, ContaPagar, Pagamento } from "@/lib/storage";
import { format } from "date-fns";

interface NewContaPagarModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function NewContaPagarModal({ onClose, onSuccess }: NewContaPagarModalProps) {
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
                categoriaId: '8', // Adjust as needed or map categories
                categoriaNome: formData.categoria,
                status: 'Pago',
                criadoEm: now
            });
        }

        onSuccess();
        onClose();
    };

    return (
        <Dialog
            isOpen={true}
            onClose={onClose}
            title="Nova Conta a Pagar"
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Fornecedor *"
                            required
                            placeholder="Nome do fornecedor"
                            value={formData.fornecedorNome}
                            onChange={e => setFormData({ ...formData, fornecedorNome: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Nº NF"
                            placeholder="Ex: 123456"
                            value={formData.numeroNF}
                            onChange={e => setFormData({ ...formData, numeroNF: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1">Categoria *</label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                        >
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            label="Descrição *"
                            required
                            placeholder="Ex: Compra de farinha 50kg"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Valor Total *"
                            type="number"
                            step="0.01"
                            required
                            placeholder="0,00"
                            className="text-lg font-bold"
                            value={formData.valorTotal}
                            onChange={e => setFormData({ ...formData, valorTotal: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Vencimento *"
                            type="date"
                            required
                            value={formData.dataVencimento}
                            onChange={e => setFormData({ ...formData, dataVencimento: e.target.value })}
                        />
                    </div>
                </div>

                <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-text-secondary">Marcar como pago agora</span>
                        <Toggle
                            checked={formData.marcarPago}
                            onChange={(checked) => setFormData({ ...formData, marcarPago: checked })}
                            size="sm"
                        />
                    </div>

                    {formData.marcarPago && (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl space-y-3 border border-green-100">
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Data Pagamento"
                                    type="date"
                                    className="bg-white"
                                    value={formData.dataPagamento}
                                    onChange={e => setFormData({ ...formData, dataPagamento: e.target.value })}
                                />
                                <div>
                                    <label className="text-xs text-text-secondary block mb-1">Forma Pagamento</label>
                                    <select
                                        className="flex h-10 w-full rounded-xl border border-border bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="danger" className="bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200">
                        Salvar Conta
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
