"use client";


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Ingrediente, Movimentacao, storage } from "@/lib/storage";
import { Trash2, Plus } from "lucide-react";

interface StockEntryFormProps {
    isOpen: boolean;
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

export function StockEntryForm({ isOpen, ingrediente, onClose, onSave }: StockEntryFormProps) {
    const listIngredientes = storage.getIngredientes();

    const [items, setItems] = useState<EntryItem[]>([]);
    const [headerData, setHeaderData] = useState({
        fornecedor: '',
        notaFiscal: '',
        dataCompra: new Date().toISOString().split('T')[0]
    });

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setItems(ingrediente ? [{ id: '1', ingredienteId: ingrediente.id, quantidade: 0, valorUnitario: 0 }] : []);
            setHeaderData({
                fornecedor: '',
                notaFiscal: '',
                dataCompra: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen, ingrediente]);

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
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Entrada (Compra)"
            className="max-w-3xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        label="Data Compra"
                        type="date"
                        required
                        value={headerData.dataCompra}
                        onChange={e => setHeaderData({ ...headerData, dataCompra: e.target.value })}
                    />
                    <Input
                        label="Nota Fiscal"
                        value={headerData.notaFiscal}
                        onChange={e => setHeaderData({ ...headerData, notaFiscal: e.target.value })}
                        placeholder="Opcional"
                    />
                    <Input
                        label="Fornecedor"
                        value={headerData.fornecedor}
                        onChange={e => setHeaderData({ ...headerData, fornecedor: e.target.value })}
                        placeholder="Opcional"
                    />
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-2">
                        <h3 className="font-bold text-sm uppercase text-text-secondary">Itens</h3>
                        {!ingrediente && (
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus size={16} className="mr-1" /> Adicionar Item
                            </Button>
                        )}
                    </div>

                    {items.length === 0 && <p className="text-center text-text-secondary py-4">Nenhum item adicionado.</p>}

                    {items.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                            <div className="md:col-span-5">
                                <label className="text-xs text-text-secondary font-bold block mb-1">Insumo</label>
                                {ingrediente ? (
                                    <div className="font-medium p-2 bg-surface border border-border rounded-xl text-sm h-10 flex items-center">{ingrediente.nome}</div>
                                ) : (
                                    <select
                                        className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                        value={item.ingredienteId}
                                        onChange={e => updateItem(item.id, 'ingredienteId', e.target.value)}
                                    >
                                        {listIngredientes.map(i => (
                                            <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-text-secondary font-bold block mb-1">Qtd</label>
                                <Input
                                    type="number" step="0.001" min="0" required
                                    value={item.quantidade}
                                    onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-text-secondary font-bold block mb-1">Valor Un.</label>
                                <Input
                                    type="number" step="0.01" min="0" required
                                    value={item.valorUnitario}
                                    onChange={e => updateItem(item.id, 'valorUnitario', e.target.value)}
                                    className="h-10"
                                />
                            </div>
                            <div className="md:col-span-1 flex justify-end md:justify-center pb-2 md:pb-0">
                                {!ingrediente && (
                                    <Button type="button" variant="ghost" size="icon" className="text-error hover:text-red-700" onClick={() => removeItem(item.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="flex flex-col md:flex-row justify-end items-center gap-4 pt-4 border-t border-border">
                    <div className="text-right w-full md:w-auto">
                        <span className="text-sm text-text-secondary block">Total da Nota</span>
                        <span className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</span>
                    </div>
                    <div className="hidden md:block h-10 w-px bg-border mx-2"></div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1 md:flex-none">Cancelar</Button>
                        <Button type="submit" className="flex-1 md:flex-none">Confirmar Entrada</Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
}
