"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Ingrediente, Movimentacao, storage } from "@/lib/storage";
import { X, Trash2, Plus } from "lucide-react";

interface StockEntryFormProps {
    ingrediente?: Ingrediente; // Pre-selected
    onClose: () => void;
    onSave: () => void;
}

interface EntryItem {
    id: string; // temp id
    ingredienteId: string;
    quantidade: number;
    valorUnitario: number;
}

export function StockEntryForm({ ingrediente, onClose, onSave }: StockEntryFormProps) {
    const listIngredientes = storage.getIngredientes();

    // Default single item if pre-selected, else empty array
    const [items, setItems] = useState<EntryItem[]>(
        ingrediente ? [{ id: '1', ingredienteId: ingrediente.id, quantidade: 0, valorUnitario: 0 }] : []
    );

    const [headerData, setHeaderData] = useState({
        fornecedor: '',
        notaFiscal: '',
        dataCompra: new Date().toISOString().split('T')[0]
    });

    const addItem = () => {
        setItems([...items, { id: crypto.randomUUID(), ingredienteId: listIngredientes[0]?.id || '', quantidade: 0, valorUnitario: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof EntryItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        items.forEach(item => {
            const ing = listIngredientes.find(i => i.id === item.ingredienteId);
            if (!ing) return;

            const qtd = Number(item.quantidade);
            const valUnit = Number(item.valorUnitario);
            const prevQtd = ing.estoqueAtual || 0;
            const newQtd = prevQtd + qtd;

            // Weighted Average Cost Calculation
            const prevTotalVal = prevQtd * (ing.custoMedio || ing.custoUnitario || 0);
            const newEntryVal = qtd * valUnit;
            const newAvgCost = (prevTotalVal + newEntryVal) / newQtd;

            // Update Ingredient
            ing.estoqueAtual = newQtd;
            ing.custoUnitario = valUnit; // Update last cost
            ing.custoMedio = newAvgCost; // Update avg cost
            ing.ultimaCompra = headerData.dataCompra;

            storage.saveIngrediente(ing);

            // Create Movement
            const mov: Movimentacao = {
                id: crypto.randomUUID(),
                tipo: 'Entrada',
                ingredienteId: ing.id,
                data: new Date().toISOString(),
                quantidade: qtd,
                quantidadeAnterior: prevQtd,
                quantidadePosterior: newQtd,
                valorUnitario: valUnit,
                valorTotal: newEntryVal,
                motivo: 'Compra',
                notaFiscal: headerData.notaFiscal,
                usuario: 'Sistema' // TODO: Get logged user
            };

            storage.saveMovimentacao(mov);
        });

        onSave();
        onClose();
    };

    const totalValue = items.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold">Registrar Entrada (Compra)</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Data Compra</label>
                            <input
                                type="date"
                                required
                                value={headerData.dataCompra}
                                onChange={e => setHeaderData({ ...headerData, dataCompra: e.target.value })}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Nota Fiscal</label>
                            <input
                                type="text"
                                value={headerData.notaFiscal}
                                onChange={e => setHeaderData({ ...headerData, notaFiscal: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Opcional"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Fornecedor</label>
                            <input
                                type="text"
                                value={headerData.fornecedor}
                                onChange={e => setHeaderData({ ...headerData, fornecedor: e.target.value })}
                                className="w-full p-2 border rounded"
                                placeholder="Opcional"
                            />
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

                        {items.length === 0 && <p className="text-center text-neutral-500 py-4">Nenhum item adicionado.</p>}

                        {items.map((item, idx) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-neutral-50 p-3 rounded">
                                <div className="col-span-5">
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
                                                <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-neutral-500 font-bold">Qtd</label>
                                    <input
                                        type="number" step="0.001" min="0" required
                                        className="w-full p-2 border rounded text-sm"
                                        value={item.quantidade}
                                        onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-neutral-500 font-bold">Valor Un.</label>
                                    <input
                                        type="number" step="0.01" min="0" required
                                        className="w-full p-2 border rounded text-sm"
                                        value={item.valorUnitario}
                                        onChange={e => updateItem(item.id, 'valorUnitario', e.target.value)}
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

                    {/* Total */}
                    <div className="flex justify-end items-center gap-4 pt-4 border-t border-neutral-200">
                        <div className="text-right">
                            <span className="text-sm text-neutral-500 block">Total da Nota</span>
                            <span className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</span>
                        </div>
                        <div className="h-10 w-px bg-neutral-300 mx-2"></div>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Confirmar Entrada</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
