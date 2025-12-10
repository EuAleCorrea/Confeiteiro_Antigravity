"use client";

import { useState } from "react";
import { StockDashboard } from "@/components/estoque/StockDashboard";
import { StockList } from "@/components/estoque/StockList";
import { MovementHistory } from "@/components/estoque/MovementHistory";
import { Button } from "@/components/ui/Button";
import { Plus, LayoutDashboard, History } from "lucide-react";
import { Ingrediente } from "@/lib/storage";
import { InventoryForm } from "@/components/estoque/InventoryForm";
import { StockEntryForm } from "@/components/estoque/StockEntryForm";
import { StockExitForm } from "@/components/estoque/StockExitForm";

export default function StockPage() {
    const [view, setView] = useState<'dashboard' | 'history'>('dashboard');
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isEntryOpen, setIsEntryOpen] = useState(false);
    const [isExitOpen, setIsExitOpen] = useState(false);
    const [selectedIngrediente, setSelectedIngrediente] = useState<Ingrediente | undefined>(undefined);

    const handleEdit = (ing: Ingrediente) => {
        setSelectedIngrediente(ing);
        setIsInventoryOpen(true);
    };

    const handleEntry = (ing: Ingrediente) => {
        setSelectedIngrediente(ing);
        setIsEntryOpen(true);
    };

    const handleExit = (ing: Ingrediente) => {
        setSelectedIngrediente(ing);
        setIsExitOpen(true);
    };

    const handleNew = () => {
        setSelectedIngrediente(undefined);
        setIsInventoryOpen(true);
    };

    const refreshData = () => {
        window.location.reload();
    };

    return (
        <div className="space-y-8 animate-in fade-in max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-800">Controle de Estoque</h1>
                    <p className="text-neutral-500">Gerenciamento de insumos, compras e movimentações</p>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="bg-neutral-100 p-1 rounded-lg flex mr-2">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${view === 'dashboard' ? 'bg-white shadow text-orange-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <LayoutDashboard size={14} /> Visão Geral
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${view === 'history' ? 'bg-white shadow text-orange-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <History size={14} /> Histórico
                        </button>
                    </div>

                    {view === 'dashboard' && (
                        <Button onClick={handleNew}>
                            <Plus size={18} className="mr-2" /> Novo Insumo
                        </Button>
                    )}
                </div>
            </div>

            {view === 'dashboard' ? (
                <>
                    <StockDashboard key={Date.now()} />
                    <StockList onEdit={handleEdit} onEntry={handleEntry} onExit={handleExit} />
                </>
            ) : (
                <MovementHistory />
            )}

            {isInventoryOpen && (
                <InventoryForm
                    ingrediente={selectedIngrediente}
                    onClose={() => setIsInventoryOpen(false)}
                    onSave={() => {
                        setIsInventoryOpen(false);
                        refreshData();
                    }}
                />
            )}

            {isEntryOpen && (
                <StockEntryForm
                    ingrediente={selectedIngrediente}
                    onClose={() => setIsEntryOpen(false)}
                    onSave={() => {
                        setIsEntryOpen(false);
                        refreshData();
                    }}
                />
            )}

            {isExitOpen && (
                <StockExitForm
                    ingrediente={selectedIngrediente}
                    onClose={() => setIsExitOpen(false)}
                    onSave={() => {
                        setIsExitOpen(false);
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}
