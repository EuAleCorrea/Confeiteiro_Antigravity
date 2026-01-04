
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { storage, ContaReceber, Pagamento } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { format } from "date-fns";

interface NewContaReceberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewContaReceberModal({ isOpen, onClose, onSuccess }: NewContaReceberModalProps) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        clienteNome: '',
        clienteTelefone: '',
        numeroOrcamento: '',
        descricao: '',
        valorTotal: '',
        dataVencimento: format(new Date(), 'yyyy-MM-dd'),
        categoria: 'Vendas Bolos',
        observacoes: '',
        marcarPago: false,
        dataPagamento: format(new Date(), 'yyyy-MM-dd'),
        formaPagamento: 'PIX' as Pagamento['formaPagamento'],
        lancarFluxo: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const valor = parseFloat(formData.valorTotal.replace(',', '.')) || 0;
        const now = new Date().toISOString();

        const novaConta: ContaReceber = {
            id: crypto.randomUUID(), // Or let Supabase generate, but standardized UUID is easier
            numeroOrcamento: formData.numeroOrcamento || undefined,
            cliente: { nome: formData.clienteNome, telefone: formData.clienteTelefone },
            descricao: formData.descricao,
            categoria: formData.categoria,
            valorTotal: valor,
            valorPago: formData.marcarPago ? valor : 0,
            saldoRestante: formData.marcarPago ? 0 : valor,
            dataCadastro: format(new Date(), 'yyyy-MM-dd'),
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

        try {
            await supabaseStorage.saveContaReceber(novaConta);

            if (formData.marcarPago && formData.lancarFluxo) {
                await supabaseStorage.saveTransacao({
                    id: crypto.randomUUID(),
                    tipo: 'Receita',
                    data: formData.dataPagamento,
                    descricao: `Recebimento: ${formData.clienteNome} - ${formData.descricao}`,
                    valor: valor,
                    categoriaId: '1',
                    categoriaNome: formData.categoria,
                    status: 'Pago',
                    criadoEm: now
                });
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar conta a receber:", error);
            alert("Erro ao salvar conta a receber.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Nova Conta a Receber"
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Cliente *"
                            required
                            placeholder="Nome do cliente"
                            value={formData.clienteNome}
                            onChange={e => setFormData({ ...formData, clienteNome: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Nº Orçamento"
                            placeholder="Ex: 25342"
                            value={formData.numeroOrcamento}
                            onChange={e => setFormData({ ...formData, numeroOrcamento: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-text-secondary block mb-1">Categoria</label>
                        <select
                            className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                        >
                            <option>Vendas Bolos</option>
                            <option>Eventos</option>
                            <option>Serviços</option>
                            <option>Outros</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            label="Descrição *"
                            required
                            placeholder="Ex: Bolo de Chocolate - Médio"
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
                                    className="bg-white h-10"
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
                                        <option>Cartão Débito</option>
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
                    <Button type="submit">
                        Salvar Conta
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
