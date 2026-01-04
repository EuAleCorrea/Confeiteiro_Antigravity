"use client";


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Ingrediente, Movimentacao } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { Trash2, Plus, AlertTriangle, Loader2 } from "lucide-react";

interface StockExitFormProps {
    isOpen: boolean;
    ingrediente?: Ingrediente; // Pre-selected
    onClose: () => void;
    onSave: () => void;
}

interface ExitItem {
    id: string;
    ingredienteId: string;
    quantidade: number;
}

export function StockExitForm({ isOpen, ingrediente, onClose, onSave }: StockExitFormProps) {
    const [listIngredientes, setListIngredientes] = useState<Ingrediente[]>([]);
    const [items, setItems] = useState<ExitItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [headerData, setHeaderData] = useState({
        dataSaida: new Date().toISOString().split('T')[0],
        motivo: 'Perda',
        observacoes: ''
    });
    const [errorModal, setErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    useEffect(() => {
        if (isOpen) {
            loadIngredientes();
            setHeaderData({
                dataSaida: new Date().toISOString().split('T')[0],
                motivo: 'Perda',
                observacoes: ''
            });
        }
    }, [isOpen]);

    async function loadIngredientes() {
        try {
            const ings = await supabaseStorage.getIngredientes();
            setListIngredientes(ings as Ingrediente[]);
            // Initialize items after loading
            if (ingrediente) {
                setItems([{ id: '1', ingredienteId: ingrediente.id, quantidade: 0 }]);
            } else {
                setItems([]);
            }
        } catch (error) {
            console.error('Erro ao carregar ingredientes:', error);
        }
    }

    const addItem = () => {
        setItems([...items, { id: crypto.randomUUID(), ingredienteId: listIngredientes[0]?.id || '', quantidade: 0 }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const updateItem = (id: string, field: keyof ExitItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            for (const item of items) {
                const ing = listIngredientes.find(i => i.id === item.ingredienteId);
                if (!ing) continue;

                const qtd = Number(item.quantidade);
                const prevQtd = ing.estoqueAtual || 0;

                if (qtd > prevQtd) {
                    setErrorModal({ open: true, message: `Estoque insuficiente para ${ing.nome}. Disponível: ${prevQtd}` });
                    setSaving(false);
                    return;
                }

                const newQtd = prevQtd - qtd;

                // Update Ingredient
                const updatedIng = {
                    ...ing,
                    estoqueAtual: newQtd
                };

                await supabaseStorage.saveIngrediente(updatedIng);

                // Create Movement
                await supabaseStorage.saveMovimentacao({
                    tipo: 'Saida',
                    ingredienteId: ing.id,
                    data: new Date().toISOString(),
                    quantidade: qtd,
                    quantidadeAnterior: prevQtd,
                    quantidadePosterior: newQtd,
                    motivo: headerData.motivo,
                    observacoes: headerData.observacoes,
                    usuario: 'Sistema'
                });
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar saída:', error);
        } finally {
            setSaving(false);
        }
    };

    return (<>
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Saída (Baixa/Perda)"
            className="max-w-2xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Data Saída"
                        type="date"
                        required
                        value={headerData.dataSaida}
                        onChange={e => setHeaderData({ ...headerData, dataSaida: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Motivo</label>
                        <select
                            value={headerData.motivo}
                            onChange={e => setHeaderData({ ...headerData, motivo: e.target.value })}
                            className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                    <div className="flex justify-between items-center border-b border-border pb-2">
                        <h3 className="font-bold text-sm uppercase text-text-secondary">Itens</h3>
                        {!ingrediente && (
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus size={16} className="mr-1" /> Adicionar Item
                            </Button>
                        )}
                    </div>

                    {items.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                            <div className="md:col-span-8">
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
                                            <option key={i.id} value={i.id}>{i.nome} (Atual: {i.estoqueAtual} {i.unidade})</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs text-text-secondary font-bold block mb-1">Qtd Saída</label>
                                <Input
                                    type="number" step="0.001" min="0" required
                                    value={item.quantidade}
                                    onChange={e => updateItem(item.id, 'quantidade', e.target.value)}
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

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Observações</label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        rows={2}
                        value={headerData.observacoes}
                        onChange={e => setHeaderData({ ...headerData, observacoes: e.target.value })}
                    ></textarea>
                </div>

                {/* Total */}
                <div className="flex justify-end items-center gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="danger" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Confirmar Saída'
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>

        {/* Error Modal */}
        <Dialog
            isOpen={errorModal.open}
            onClose={() => setErrorModal({ open: false, message: '' })}
            title="Atenção"
            className="max-w-sm z-[60]"
        >
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} className="text-error" />
                </div>
                <p className="text-text-primary font-medium">{errorModal.message}</p>
                <Button onClick={() => setErrorModal({ open: false, message: '' })} className="w-full">
                    OK
                </Button>
            </div>
        </Dialog>
    </>);
}
