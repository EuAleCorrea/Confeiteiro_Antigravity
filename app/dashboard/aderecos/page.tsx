"use client";

import { useState } from "react";
import { Plus, Search, Loader2, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AderecosPage() {
    const [loading] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-text-secondary">Carregando adereços...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Adereços</h1>
                    <p className="text-text-secondary">Gerencie os adereços e decorações dos seus produtos</p>
                </div>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Novo Adereço
                </Button>
            </div>

            <div className="flex items-center gap-2 bg-surface p-2 rounded-xl border border-border max-w-md">
                <Search size={20} className="text-text-secondary ml-2" />
                <input
                    type="text"
                    placeholder="Buscar adereços..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                />
            </div>

            {/* Empty State */}
            <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Nenhum adereço cadastrado
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    Cadastre adereços como toppers, velas, fitas e outros itens decorativos para adicionar aos seus produtos.
                </p>
                <Button>
                    <Plus size={20} className="mr-2" />
                    Cadastrar Primeiro Adereço
                </Button>
            </div>
        </div>
    );
}
