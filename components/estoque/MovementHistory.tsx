"use client";

import { useState, useEffect } from "react";
import { Movimentacao, Ingrediente } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, RefreshCw } from "lucide-react";

export function MovementHistory() {
    const [movements, setMovements] = useState<Movimentacao[]>([]);
    const [ingredientes, setIngredientes] = useState<Record<string, string>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const [movs, ings] = await Promise.all([
                    supabaseStorage.getMovimentacoes(),
                    supabaseStorage.getIngredientes()
                ]);
                setMovements(movs as Movimentacao[]);
                const ingMap = (ings as Ingrediente[]).reduce((acc, ing) => {
                    acc[ing.id] = ing.nome;
                    return acc;
                }, {} as Record<string, string>);
                setIngredientes(ingMap);
            } catch (error) {
                console.error('Erro ao carregar movimentações:', error);
            }
        };
        loadData();
    }, []);

    return (
        <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
                <h3 className="font-bold text-neutral-700">Histórico de Movimentações</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm item-center text-left text-neutral-600">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50 border-b">
                        <tr>
                            <th className="px-4 py-3">Data</th>
                            <th className="px-4 py-3">Insumo</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Motivo</th>
                            <th className="px-4 py-3 text-right">Qtd</th>
                            <th className="px-4 py-3 text-right">Valor Total</th>
                            <th className="px-4 py-3">Resp.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                                    Nenhuma movimentação registrada.
                                </td>
                            </tr>
                        ) : (
                            movements.map(mov => (
                                <tr key={mov.id} className="border-b last:border-0 hover:bg-neutral-50/50">
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                                        {new Date(mov.data).toLocaleDateString()} <span className="text-xs text-neutral-400">{new Date(mov.data).toLocaleTimeString().slice(0, 5)}</span>
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                        {ingredientes[mov.ingredienteId] || 'Item Removido'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-xs font-bold inline-flex items-center gap-1",
                                            mov.tipo === 'Entrada' ? "bg-green-100 text-green-700" :
                                                mov.tipo === 'Saida' ? "bg-red-100 text-red-700" :
                                                    "bg-blue-100 text-blue-700"
                                        )}>
                                            {mov.tipo === 'Entrada' ? <ArrowDown size={10} className="rotate-0" /> :
                                                mov.tipo === 'Saida' ? <ArrowUp size={10} className="rotate-0" /> :
                                                    <RefreshCw size={10} />}
                                            {mov.tipo === 'Saida' ? 'Saída' : mov.tipo}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">{mov.motivo}</td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {mov.tipo === 'Saida' ? '-' : '+'}{mov.quantidade}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {mov.valorTotal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valorTotal) : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-xs">{mov.usuario}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
