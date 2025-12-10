"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Ingrediente, Movimentacao, storage } from "@/lib/storage";
import { X, Trash2, Plus } from "lucide-react";

interface StockExitFormProps {
    ingrediente?: Ingrediente; // Pre-selected
    onClose: () => void;
    onSave: () => void;
}

interface ExitItem {
    id: string;
    ingredienteId: string;
    quantidade: number;
}

export function StockExitForm({ ingrediente, onClose, onSave }: StockExitFormProps) {
    const listIngredientes = storage.getIngredientes();

    const [items, setItems] = useState<ExitItem[]>(
        ingrediente ? [{ id: '1', ingredienteId: ingrediente.id, quantidade: 0 }] : []
    );

    const [headerData, setHeaderData] = useState({
        dataSaida: new Date().toISOString().split('T')[0],
        motivo: 'Perda',
        observacoes: ''
    });

    const addItem = () => {
        setItems([...items, { id: crypto.randomUUID(), ingredienteId: listIngredientes[0]?.id || '', quantidade: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof ExitItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let hasError = false;

        items.forEach(item => {
            if (hasError) return;

            const ing = listIngredientes.find(i => i.id === item.ingredienteId);
            if (!ing) return;

            const qtd = Number(item.quantidade);
            const prevQtd = ing.estoqueAtual || 0;

            if (qtd > prevQtd) {
                alert(`Erro: Estoque insuficiente para ${ing.nome}. Disponível: ${prevQtd}`);
                hasError = true;
                return;
            }

            const newQtd = prevQtd - qtd;

            // Update Ingredient
            ing.estoqueAtual = newQtd;
            storage.saveIngrediente(ing);

            // Create Movement
            const mov: Movimentacao = {
                id: crypto.randomUUID(),
                tipo: 'Saida',
                ingredienteId: ing.id,
                data: new Date().toISOString(),
                quantidade: qtd,
                quantidadeAnterior: prevQtd,
                quantidadePosterior: newQtd,
                motivo: headerData.motivo,
                observacoes: headerData.observacoes,
                usuario: 'Sistema'
            };

            storage.saveMovimentacao(mov);
        });

        if (!hasError) {
            onSave();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold">Registrar Saída (Baixa/Perda)</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Data Saída</label>
                            <input
                                type="date"
                                required
                                value={headerData.dataSaida}
                                onChange={e => setHeaderData({ ...headerData, dataSaida: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Motivo</label>
                            <select
                                value={headerData.motivo}
                                onChange={e => setHeaderData({ ...headerData, motivo: e.target.value })}
                                className="w-full p-2 border rounded"
                            >
                                <option value="Perda">Perda / Vencimento</option>
                                <option value="Quebra">Quebra / Acidente</option>
                                <option value="Amostra">Amostra / Degustação</option>
                                <option value="Consumo Interno">Consumo Interno</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="font-bold text-sm uppercase text-neutral-500">Itens</h3>
                            {!ingrediente && (
                                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                    <Plus size={16} className="mr-1" /> Adicionar Item
                                </Button>
                            )}
                        </div>

                        {items.map((item, idx) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-neutral-50 p-3 rounded">
                                <div className="col-span-8">
                                    <label className="text-xs text-neutral-500 font-bold">Insumo</label>
                                    {ingrediente ? (
                                        <div className="font-medium p-2 bg-white border rounded">{ingrediente.nome}</div>
                                    ) : (
                                        <select
                                            className="w-full p-2 border rounded text-sm"
                                            value={item.ingredienteId}
                                            onChange={e => updateItem(item.id, 'ingredienteId', e.target.value)}
                                        >
                                            {listIngredientes.map(i => (
                                                <option key={i.id} value={i.id}>{i.nome} (Atual: {i.estoqueAtual} {i.unidade})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-neutral-500 font-bold">Qtd Saída</label>
                                    <input
                                        type="number" step="0.001" min="0" required
                                        className="w-full p-2 border rounded text-sm"
                                        value={item.quantidade}
                                        onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1">
                                    {!ingrediente && (
                                        <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(item.id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Observações</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            rows={2}
                            value={headerData.observacoes}
                            onChange={e => setHeaderData({ ...headerData, observacoes: e.target.value })}
                        ></textarea>
                    </div>

                    {/* Total */}
                    <div className="flex justify-end items-center gap-2 pt-4 border-t border-neutral-200">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="danger">Confirmar Saída</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
