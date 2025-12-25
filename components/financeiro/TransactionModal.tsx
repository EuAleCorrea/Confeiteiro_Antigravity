"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { storage, CashFlowCategory } from "@/lib/storage";
import { format } from "date-fns";
import { Toggle } from "@/components/ui/Toggle";

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'Receita' | 'Despesa';
    onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, type, onSuccess }: TransactionModalProps) {
    const [categories, setCategories] = useState<CashFlowCategory[]>([]);
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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const valorNum = parseFloat(formData.valor.replace(',', '.').replace(/[^0-9.-]/g, ''));
        const categoryCallback = categories.find(c => c.id === formData.categoriaId);

        // 1. Save Transaction
        storage.saveTransacao({
            id: crypto.randomUUID(),
            tipo: type,
            data: formData.data,
            descricao: formData.descricao,
            valor: valorNum,
            categoriaId: formData.categoriaId,
            categoriaNome: categoryCallback?.nome || 'Desconhecido',
            status: 'Pago', // Default to Paid for quick entry
            criadoEm: new Date().toISOString(),
            observacoes: formData.observacoes
        });

        // 2. Update Cash Flow (Spreadsheet) if checked
        if (formData.lancarFluxo) {
            const monthStr = formData.data.substring(0, 7); // YYYY-MM
            const currentFlux = storage.getFluxoCaixa();
            const monthData = currentFlux.find(f => f.periodo === monthStr) || { periodo: monthStr, valores: {} };

            const currentVal = monthData.valores[formData.categoriaId] || 0;
            const newVal = currentVal + valorNum; // Accumulate

            monthData.valores[formData.categoriaId] = newVal;
            storage.saveFluxoCaixa(monthData);
        }

        onSuccess();
        onClose();
        // Reset form handling? controlled by isOpen/useEffect mostly
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                    <h2 className="text-xl font-bold text-neutral-800">
                        {type === 'Receita' ? '💰 Registrar Receita' : '💸 Registrar Despesa'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Data *</label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-neutral-600"
                            value={formData.data}
                            onChange={e => setFormData({ ...formData, data: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Descrição *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Venda de bolo, Compra de açúcar"
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Valor (R$) *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="0,00"
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg font-bold text-neutral-800"
                            value={formData.valor}
                            onChange={e => setFormData({ ...formData, valor: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Categoria *</label>
                        <select
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none"
                            value={formData.categoriaId}
                            onChange={e => setFormData({ ...formData, categoriaId: e.target.value })}
                        >
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-neutral-700">Observações</label>
                        <textarea
                            rows={2}
                            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                            value={formData.observacoes}
                            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-neutral-600">Lançar no Fluxo de Caixa (Planilha)</span>
                        <Toggle
                            checked={formData.lancarFluxo}
                            onChange={(checked) => setFormData({ ...formData, lancarFluxo: checked })}
                            size="sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-3 px-4 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all translate-y-0 active:translate-y-0.5"
                        >
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
