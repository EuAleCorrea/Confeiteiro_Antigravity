"use client";


import { useState, useEffect } from "react";
import { storage, CashFlowCategory } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/Toggle";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'Receita' | 'Despesa';
    onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, type, onSuccess }: TransactionModalProps) {
    const [categories, setCategories] = useState<CashFlowCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        data: format(new Date(), 'yyyy-MM-dd'),
        descricao: '',
        valor: '',
        categoriaId: '',
        observacoes: '',
        lancarFluxo: true
    });

    useEffect(() => {
        if (isOpen) {
            // Load categories from Supabase (assuming existing categories are static or we fetch them)
            // For now, we'll keep using the static ones or fetch from supabase if available
            // Note: Currently Categories for finance might still be hardcoded or in local storage,
            // but the plan says "Products (includes Categories) done". Financial categories are different.
            // Let's rely on storage.getFinCategorias() for categories if they are not migrated yet,
            // OR ideally migrate them. The prompt says "Financeiro" is next.
            // Assuming categories are static for now or strictly defined.
            const allCats = storage.getFinCategorias();
            // Filter categories based on Type
            const filtered = allCats.filter(c => {
                if (type === 'Receita') return c.tipo === 'Receita';
                return c.tipo !== 'Receita'; // All expenses
            });
            setCategories(filtered);

            // Set default category
            if (filtered.length > 0) {
                setFormData(prev => ({ ...prev, categoriaId: filtered[0].id }));
            }
        }
    }, [isOpen, type]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const valorNum = parseFloat(formData.valor.replace(',', '.').replace(/[^0-9.-]/g, ''));
            const categoryCallback = categories.find(c => c.id === formData.categoriaId);

            // 1. Save Transaction to Supabase
            await supabaseStorage.saveTransacao({
                tipo: type,
                data: formData.data,
                descricao: formData.descricao,
                valor: valorNum,
                categoriaId: formData.categoriaId,
                categoriaNome: categoryCallback?.nome || 'Desconhecido',
                status: 'Pago', // Default to Paid for quick entry
                observacoes: formData.observacoes
            });

            // 2. Update Cash Flow (Spreadsheet) if checked
            // NOTE: Fluxo de Caixa is not fully migrated yet in this step, but we should update it if possible.
            // Since `supabaseStorage` does not have `saveFluxoCaixa` yet, strict adherence to the plan means
            // we might break this sync feature until Fluxo is migrated.
            // However, the plan mentions migrating "sub-pages" later.
            // For now, we will NOT sync with the *local* flux storage to avoid inconsistency.
            // The "Fluxo de Caixa" page should eventually read from Transactions table + aggregation.

            // If we really need to keep the "Lançar no Fluxo" feature working with the OLD system,
            // we'd have to call `storage.saveFluxoCaixa`. But that creates split-brain data.
            // DECISION: We will rely on the Transactions table as the source of truth for Fluxo de Caixa moving forward.
            // So we don't need to save to a separate "FluxoCaixa" table if we calculate it on the fly.
            // We will temporarily comment out the legacy storage sync.

            /*
            if (formData.lancarFluxo) {
                const monthStr = formData.data.substring(0, 7); // YYYY-MM
                const currentFlux = storage.getFluxoCaixa();
                const monthData = currentFlux.find(f => f.periodo === monthStr) || { periodo: monthStr, valores: {} };

                const currentVal = monthData.valores[formData.categoriaId] || 0;
                const newVal = currentVal + valorNum; // Accumulate

                monthData.valores[formData.categoriaId] = newVal;
                storage.saveFluxoCaixa(monthData);
            }
            */

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar transação:", error);
            alert("Erro ao salvar. Verifique o console.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={type === 'Receita' ? '💰 Registrar Receita' : '💸 Registrar Despesa'}
            className="max-w-md"
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Input
                    label="Data *"
                    type="date"
                    required
                    value={formData.data}
                    onChange={e => setFormData({ ...formData, data: e.target.value })}
                />

                <Input
                    label="Descrição *"
                    placeholder="Ex: Venda de bolo, Compra de açúcar"
                    required
                    value={formData.descricao}
                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                />

                <Input
                    label="Valor (R$) *"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    className="text-lg font-bold"
                    value={formData.valor}
                    onChange={e => setFormData({ ...formData, valor: e.target.value })}
                />

                <div className="space-y-1">
                    <label className="text-sm font-medium text-text-secondary">Categoria *</label>
                    <select
                        className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        value={formData.categoriaId}
                        onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.nome}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-text-secondary">Observações</label>
                    <textarea
                        rows={2}
                        className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                        value={formData.observacoes}
                        onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    />
                </div>

                {/* 
                <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-text-secondary">Lançar no Fluxo de Caixa (Planilha)</span>
                    <Toggle
                        checked={formData.lancarFluxo}
                        onChange={(checked) => setFormData({ ...formData, lancarFluxo: checked })}
                        size="sm"
                    />
                </div>
                */}

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant={type === 'Receita' ? 'primary' : 'danger'} disabled={saving}>
                        {saving ? 'Salvando...' : 'Confirmar'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}

