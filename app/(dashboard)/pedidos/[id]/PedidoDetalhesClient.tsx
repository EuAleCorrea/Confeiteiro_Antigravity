"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { storage, Pedido } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/pedidos/StatusBadge";
import { ArrowLeft, Edit, Trash2, Printer, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Tabs
import { TabResumo } from "@/components/pedidos/details/TabResumo";
import { TabHistorico } from "@/components/pedidos/details/TabHistorico";
import { TabProducao } from "@/components/pedidos/details/TabProducao";
import { TabEntrega } from "@/components/pedidos/details/TabEntrega";
import { TabFinanceiro } from "@/components/pedidos/details/TabFinanceiro";
import { TabAderecos } from "@/components/pedidos/details/TabAderecos";

export default function PedidoDetalhesClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [activeTab, setActiveTab] = useState<'resumo' | 'aderecos' | 'producao' | 'entrega' | 'financeiro' | 'historico'>('resumo');

    useEffect(() => {
        if (id) {
            const found = storage.getPedidoById(id);
            if (found) {
                setPedido(found);
            } else {
                if (id !== "placeholder") {
                    // router.push('/pedidos');
                }
            }
        }
    }, [id, router]);

    const handleDelete = () => {
        if (pedido && confirm('Tem certeza que deseja excluir este pedido?')) {
            storage.deletePedido(pedido.id);
            router.push('/pedidos');
        }
    };

    const handleWhatsApp = () => {
        if (!pedido || !pedido.cliente.telefone) return;
        // Format phone (remove non-digits)
        const phone = pedido.cliente.telefone.replace(/\D/g, '');
        const message = `Olá ${pedido.cliente.nome}, referente ao seu pedido #${pedido.numero}...`;
        window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!pedido) {
        return (
            <div className="p-8 text-center text-text-secondary">
                {id === "placeholder" ? "Acesse um pedido da lista para ver os detalhes." : "Carregando..."}
            </div>
        );
    }

    const tabs = [
        { id: 'resumo', label: 'Resumo' },
        { id: 'aderecos', label: 'Adereços' },
        { id: 'producao', label: 'Produção' },
        { id: 'entrega', label: 'Entrega' },
        { id: 'financeiro', label: 'Financeiro' },
        { id: 'historico', label: 'Histórico' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/pedidos">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-800">Pedido #{pedido.numero}</h1>
                            <StatusBadge status={pedido.status} />
                        </div>
                        <p className="text-text-secondary">
                            Cliente: {pedido.cliente.nome} • {new Date(pedido.dataEntrega).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Link href={`/pedidos/${pedido.id}/print`} target="_blank">
                        <Button variant="outline" title="Imprimir Produção">
                            <Printer size={18} className="mr-2" /> Imprimir
                        </Button>
                    </Link>

                    <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleWhatsApp} title="WhatsApp">
                        <MessageCircle size={18} className="mr-2" /> WhatsApp
                    </Button>

                    <Link href={`/pedidos/${pedido.id}/editar`}>
                        <Button variant="outline" title="Editar Pedido">
                            <Edit size={18} />
                        </Button>
                    </Link>

                    <Button variant="danger" size="icon" onClick={handleDelete} title="Excluir">
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border">
                <nav className="flex gap-6 overflow-x-auto pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap pb-3 text-sm font-medium border-b-2 transition-colors px-1",
                                activeTab === tab.id
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'resumo' && <TabResumo pedido={pedido} />}
                {activeTab === 'aderecos' && <TabAderecos pedido={pedido} onUpdate={setPedido} />}
                {activeTab === 'producao' && <TabProducao pedido={pedido} />}
                {activeTab === 'entrega' && <TabEntrega pedido={pedido} />}
                {activeTab === 'financeiro' && <TabFinanceiro pedido={pedido} />}
                {activeTab === 'historico' && <TabHistorico pedido={pedido} />}
            </div>
        </div>
    );
}
