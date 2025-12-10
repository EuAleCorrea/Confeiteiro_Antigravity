"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Ingrediente, storage } from "@/lib/storage";
import { X } from "lucide-react";

interface InventoryFormProps {
    ingrediente?: Ingrediente;
    onClose: () => void;
    onSave: () => void;
}

export function InventoryForm({ ingrediente, onClose, onSave }: InventoryFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<Ingrediente>({
        defaultValues: ingrediente || {
            unidade: 'kg',
            categoria: 'Secos',
            estoqueAtual: 0,
            estoqueMinimo: 0,
            custoUnitario: 0
        }
    });

    const onSubmit = (data: Ingrediente) => {
        const item: Ingrediente = {
            ...data,
            id: ingrediente?.id || crypto.randomUUID(),
            custoMedio: Number(data.custoUnitario), // Init average cost as current cost for new items
            estoqueAtual: Number(data.estoqueAtual),
            estoqueMinimo: Number(data.estoqueMinimo),
            estoqueMaximo: data.estoqueMaximo ? Number(data.estoqueMaximo) : undefined,
            custoUnitario: Number(data.custoUnitario),
            atualizadoEm: new Date().toISOString()
        };

        storage.saveIngrediente(item);

        // Log Initial Adjustment if new
        if (!ingrediente && item.estoqueAtual > 0) {
            storage.saveMovimentacao({
                id: crypto.randomUUID(),
                tipo: 'Ajuste',
                ingredienteId: item.id,
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
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-xl font-bold">{ingrediente ? 'Editar Insumo' : 'Novo Insumo'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase text-neutral-500 border-b pb-1">Informações Básicas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome do Insumo *</label>
                                <input {...register("nome", { required: true })} className="w-full p-2 border rounded" placeholder="Ex: Farinha de Trigo" />
                                {errors.nome && <span className="text-red-500 text-xs">Obrigatório</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria *</label>
                                <select {...register("categoria")} className="w-full p-2 border rounded">
                                    {storage.getCategorias().map(c => (
                                        <option key={c.id} value={c.nome}>{c.nome}</option>
                                    ))}
                                    {/* Fallback option if somehow empty or for "Outros" visibility if needed */}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Unidade *</label>
                                <select {...register("unidade")} className="w-full p-2 border rounded">
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
                        <h3 className="font-bold text-sm uppercase text-neutral-500 border-b pb-1">Estoque</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Estoque Atual *</label>
                                <input type="number" step="0.001" {...register("estoqueAtual", { required: true, min: 0 })} className="w-full p-2 border rounded" disabled={!!ingrediente} />
                                {errors.estoqueAtual && <span className="text-red-500 text-xs">Inválido</span>}
                                {ingrediente && <span className="text-xs text-neutral-400">Use 'Entrada' ou 'Saída' para alterar</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Mínimo (Alerta) *</label>
                                <input type="number" step="0.001" {...register("estoqueMinimo", { required: true, min: 0 })} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Máximo (Opcional)</label>
                                <input type="number" step="0.001" {...register("estoqueMaximo")} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Cost & Details */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-sm uppercase text-neutral-500 border-b pb-1">Custos & Detalhes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Custo Unitário (Última Compra) *</label>
                                <input type="number" step="0.01" {...register("custoUnitario", { required: true, min: 0 })} className="w-full p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Localização</label>
                                <input {...register("localizacao")} className="w-full p-2 border rounded" placeholder="Ex: Prateleira 2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Marca Preferida</label>
                                <input {...register("marca")} className="w-full p-2 border rounded" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar Insumo</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
