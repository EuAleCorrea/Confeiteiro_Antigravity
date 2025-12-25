import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { ContaReceber, Pagamento } from "@/lib/storage";
import { format } from "date-fns";

interface ReceivablePaymentModalProps {
    conta: ContaReceber;
    onClose: () => void;
    onSuccess: (contaId: string, payment: Pagamento, lancadoFluxo: boolean) => void;
}

export function ReceivablePaymentModal({ conta, onClose, onSuccess }: ReceivablePaymentModalProps) {
    const [formData, setFormData] = useState({
        dataPagamento: format(new Date(), 'yyyy-MM-dd'),
        valorRecebido: conta.saldoRestante.toString(),
        formaPagamento: 'PIX' as Pagamento['formaPagamento'],
        observacoes: '',
        lancarFluxo: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const valor = parseFloat(formData.valorRecebido.replace(',', '.')) || 0;

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
        <Dialog
            isOpen={true}
            onClose={onClose}
            title="Registrar Pagamento"
            className="max-w-md"
        >
            <div className="mb-6 p-4 bg-surface-secondary border border-border rounded-xl space-y-1">
                <p className="text-sm text-text-secondary">Conta: <span className="font-medium text-text-primary">#{conta.numeroOrcamento || conta.id.slice(0, 8)} - {conta.cliente.nome}</span></p>
                <p className="text-sm text-text-secondary">Descrição: <span className="text-text-primary">{conta.descricao}</span></p>
                <p className="text-sm text-text-secondary">Valor Total: <span className="font-bold text-text-primary">R$ {conta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                <p className="text-sm text-text-secondary">Saldo Restante: <span className="font-bold text-green-600">R$ {conta.saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Input
                            label="Data Pagamento *"
                            type="date"
                            required
                            value={formData.dataPagamento}
                            onChange={e => setFormData({ ...formData, dataPagamento: e.target.value })}
                        />
                    </div>
                    <div>
                        <Input
                            label="Valor Recebido *"
                            type="number"
                            step="0.01"
                            required
                            className="text-lg font-bold"
                            value={formData.valorRecebido}
                            onChange={e => setFormData({ ...formData, valorRecebido: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-text-secondary block mb-1">Forma de Pagamento *</label>
                    <select
                        className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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

                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-text-secondary">Lançar receita no Fluxo de Caixa</span>
                    <Toggle
                        checked={formData.lancarFluxo}
                        onChange={(checked) => setFormData({ ...formData, lancarFluxo: checked })}
                        size="sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700 text-white shadow-green-200">
                        Confirmar Pagamento
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
