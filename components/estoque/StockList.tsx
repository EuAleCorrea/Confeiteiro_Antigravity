"use client";

import { useState, useEffect } from "react";
import { Ingrediente } from "@/lib/storage";
import { supabaseStorage } from "@/lib/supabase-storage";
import { Button } from "@/components/ui/Button";
import { Package, Search, Filter, AlertTriangle, BatteryWarning, BatteryMedium, BatteryFull, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryManager } from "./CategoryManager";

interface StockListProps {
    onEdit: (ing: Ingrediente) => void;
    onEntry: (ing: Ingrediente) => void;
    onExit: (ing: Ingrediente) => void;
}

export function StockList({ onEdit, onEntry, onExit }: StockListProps) {
    const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
    const [categories, setCategories] = useState<string[]>(['Todos']);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [ings, cats] = await Promise.all([
                supabaseStorage.getIngredientes(),
                supabaseStorage.getCategoriasIngredientes()
            ]);
            setIngredientes(ings as Ingrediente[]);
            setCategories(['Todos', ...cats.map(c => c.nome)]);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const filtered = ingredientes.filter(ing => {
        const matchesCategory = filterCategory === 'Todos' || ing.categoria === filterCategory;
        const matchesSearch = ing.nome.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getStatus = (ing: Ingrediente) => {
        if (!ing.estoqueAtual || ing.estoqueAtual === 0) return { label: 'Sem Estoque', color: 'red', icon: BatteryWarning };
        if (ing.estoqueAtual <= ing.estoqueMinimo) return { label: 'Crítico', color: 'red', icon: AlertTriangle };
        if (ing.estoqueAtual <= (ing.estoqueMinimo * 1.2)) return { label: 'Baixo', color: 'yellow', icon: BatteryMedium };
        return { label: 'Normal', color: 'green', icon: BatteryFull };
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 space-y-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar insumo por nome..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-neutral-500 font-medium">
                        Exibindo {filtered.length} itens {filterCategory !== 'Todos' && `em ${filterCategory}`}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Filtrar por Categoria</label>
                        <button
                            onClick={() => setIsCategoryManagerOpen(true)}
                            className="text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium transition-colors"
                        >
                            <Settings size={12} />
                            Gerenciar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                                    filterCategory === cat
                                        ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200 transform scale-105"
                                        : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(ing => {
                    const status = getStatus(ing);
                    const StatusIcon = status.icon;

                    return (
                        <div key={ing.id} className={cn(
                            "group bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md",
                            status.color === 'red' ? "border-red-100 bg-red-50/30" :
                                status.color === 'yellow' ? "border-yellow-100 bg-yellow-50/30" :
                                    "border-neutral-100 hover:border-orange-200"
                        )}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-neutral-800 line-clamp-1" title={ing.nome}>{ing.nome}</h3>
                                    <span className="text-xs text-neutral-500">{ing.categoria}</span>
                                </div>
                                <div className={cn(
                                    "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
                                    status.color === 'red' ? "bg-red-100 text-red-700" :
                                        status.color === 'yellow' ? "bg-yellow-100 text-yellow-700" :
                                            "bg-green-100 text-green-700"
                                )}>
                                    <StatusIcon size={12} />
                                    {status.label}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-white/50 p-2 rounded">
                                    <div className="text-[10px] uppercase text-neutral-500 font-bold">Estoque</div>
                                    <div className="text-lg font-bold text-neutral-800">
                                        {ing.estoqueAtual} <span className="text-xs font-normal text-neutral-500">{ing.unidade}</span>
                                    </div>
                                </div>
                                <div className="bg-white/50 p-2 rounded">
                                    <div className="text-[10px] uppercase text-neutral-500 font-bold">Mínimo</div>
                                    <div className="text-sm font-medium text-neutral-600">
                                        {ing.estoqueMinimo} {ing.unidade}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(ing)}>
                                    Editar
                                </Button>
                                <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => onEntry(ing)}>
                                    Entrada
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => onExit(ing)}>
                                    Saída
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <CategoryManager
                isOpen={isCategoryManagerOpen}
                onClose={() => setIsCategoryManagerOpen(false)}
                onCallback={loadData}
            />
        </div>
    );
}
