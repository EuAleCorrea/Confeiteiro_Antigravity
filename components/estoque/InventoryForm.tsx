"use client";


import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { Ingrediente } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { Loader2 } from "lucide-react";

interface InventoryFormProps {
    isOpen: boolean;
    ingrediente?: Ingrediente;
    onClose: () => void;
    onSave: () => void;
}

export function InventoryForm({ isOpen, ingrediente, onClose, onSave }: InventoryFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<Ingrediente>();
    const [categorias, setCategorias] = useState<{ id: string; nome: string }[]>([]);
    const [saving, setSaving] = useState(false);

    // Load categories when modal opens
    useEffect(() => {
        if (isOpen) {
            loadCategorias();
            reset(ingrediente || {
                unidade: 'kg',
                categoria: 'Secos',
                estoqueAtual: 0,
                estoqueMinimo: 0,
                custoUnitario: 0
            });
        }
    }, [ingrediente, isOpen, reset]);

    async function loadCategorias() {
        try {
            const cats = await supabaseStorage.getCategoriasIngredientes();
            setCategorias(cats);
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    const onSubmit = async (data: Ingrediente) => {
        setSaving(true);
        try {
            const item: Partial<Ingrediente> = {
                ...data,
                ...(ingrediente?.id ? { id: ingrediente.id } : {}),
                custoMedio: Number(data.custoUnitario), // Init average cost as current cost for new items
                estoqueAtual: Number(data.estoqueAtual),
                estoqueMinimo: Number(data.estoqueMinimo),
                estoqueMaximo: data.estoqueMaximo ? Number(data.estoqueMaximo) : undefined,
                custoUnitario: Number(data.custoUnitario),
                atualizadoEm: new Date().toISOString()
            };

            const savedItem = await supabaseStorage.saveIngrediente(item);

            // Log Initial Adjustment if new
            if (!ingrediente && item.estoqueAtual && item.estoqueAtual > 0 && savedItem) {
                await supabaseStorage.saveMovimentacao({
                    tipo: 'Ajuste',
                    ingredienteId: savedItem.id,
                    data: new Date().toISOString(),
                    quantidade: item.estoqueAtual,
                    quantidadeAnterior: 0,
                    quantidadePosterior: item.estoqueAtual,
                    motivo: 'Inventário Inicial',
                    usuario: 'Sistema'
                });
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Erro ao salvar insumo:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={ingrediente ? 'Editar Insumo' : 'Novo Insumo'}
            className="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-text-secondary border-b border-border pb-1">Informações Básicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nome do Insumo *"
                            {...register("nome", { required: true })}
                            error={errors.nome ? "Obrigatório" : undefined}
                            placeholder="Ex: Farinha de Trigo"
                        />

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria *</label>
                            <select {...register("categoria")} className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                                {categorias.map(c => (
                                    <option key={c.id} value={c.nome}>{c.nome}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Unidade *</label>
                            <select {...register("unidade")} className="flex h-12 w-full rounded-xl border border-border bg-surface px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                                <option value="kg">Quilos (kg)</option>
                                <option value="g">Gramas (g)</option>
                                <option value="l">Litros (l)</option>
                                <option value="ml">Mililitros (ml)</option>
                                <option value="un">Unidade (un)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stock Settings */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-text-secondary border-b border-border pb-1">Estoque</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Input
                                label="Estoque Atual *"
                                type="number" step="0.001"
                                {...register("estoqueAtual", { required: true, min: 0 })}
                                error={errors.estoqueAtual ? "Inválido" : undefined}
                                disabled={!!ingrediente}
                            />
                            {ingrediente && <span className="text-xs text-text-secondary mt-1 block">Use 'Entrada' ou 'Saída' para alterar</span>}
                        </div>
                        <Input
                            label="Mínimo (Alerta) *"
                            type="number" step="0.001"
                            {...register("estoqueMinimo", { required: true, min: 0 })}
                        />
                        <Input
                            label="Máximo (Opcional)"
                            type="number" step="0.001"
                            {...register("estoqueMaximo")}
                        />
                    </div>
                </div>

                {/* Cost & Details */}
                <div className="space-y-4">
                    <h3 className="font-bold text-sm uppercase text-text-secondary border-b border-border pb-1">Custos & Detalhes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Custo Unitário *"
                            type="number" step="0.01"
                            {...register("custoUnitario", { required: true, min: 0 })}
                        />
                        <Input
                            label="Localização"
                            {...register("localizacao")}
                            placeholder="Ex: Prateleira 2"
                        />
                        <Input
                            label="Marca Preferida"
                            {...register("marca")}
                            className="col-span-2 md:col-span-1"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            'Salvar Insumo'
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
