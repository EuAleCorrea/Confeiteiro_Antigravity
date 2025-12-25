"use client";

import { Pedido, storage } from "@/lib/storage";
import { StatusBadge } from "../StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, DollarSign, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface KanbanViewProps {
    pedidos: Pedido[];
    onStatusChange: (pedidoId: string, newStatus: Pedido['status']) => void;
}

const COLUMNS: { id: Pedido['status']; label: string; shortLabel: string }[] = [
    { id: 'Pagamento Pendente', label: 'Pagamento Pendente', shortLabel: 'Pagto' },
    { id: 'Aguardando Produção', label: 'Aguardando', shortLabel: 'Aguard.' },
    { id: 'Em Produção', label: 'Em Produção', shortLabel: 'Produção' },
    { id: 'Pronto', label: 'Pronto', shortLabel: 'Pronto' },
    { id: 'Entregue', label: 'Entregue', shortLabel: 'Entregue' },
];

export function KanbanView({ pedidos, onStatusChange }: KanbanViewProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggingId(id);
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: Pedido['status']) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        if (id && id === draggingId) {
            onStatusChange(id, status);
        }
        setDraggingId(null);
    };

    const activeColumn = COLUMNS[activeColumnIndex];
    const activeColumnPedidos = pedidos.filter(p => p.status === activeColumn.id);

    const renderCard = (pedido: Pedido) => (
        <div
            key={pedido.id}
            draggable
            onDragStart={(e) => handleDragStart(e, pedido.id)}
            className={`
                cursor-grab active:cursor-grabbing transform transition-all 
                ${draggingId === pedido.id ? 'opacity-50 scale-95' : 'opacity-100 hover:-translate-y-1'}
            `}
        >
            <Link href={`/pedidos/${pedido.id}`}>
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-primary">
                    <CardContent className="p-3 space-y-3 text-sm">
                        {/* Header Image or Placeholder */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-neutral-800 line-clamp-1">{pedido.cliente.nome}</p>
                                <p className="text-xs text-neutral-500">#{pedido.numero}</p>
                            </div>
                            {pedido.prioridade === 'Urgente' && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Urgente</span>
                            )}
                        </div>

                        {/* Date & Location */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-neutral-600">
                                <Calendar size={12} />
                                <span className="text-xs">{new Date(pedido.dataEntrega).toLocaleDateString()}</span>
                                <Clock size={12} className="ml-1" />
                                <span className="text-xs">{pedido.horaEntrega}</span>
                            </div>
                            {pedido.tipo === 'Entrega' && (
                                <div className="flex items-center gap-1.5 text-neutral-600 line-clamp-1">
                                    <MapPin size={12} />
                                    <span className="text-xs truncate">{pedido.entrega.endereco?.bairro || 'Entrega'}</span>
                                </div>
                            )}
                        </div>

                        {/* Items Summary */}
                        <div className="pt-2 border-t border-neutral-100">
                            <p className="font-medium text-neutral-800 line-clamp-1">
                                {pedido.itens[0]?.nome}
                            </p>
                            {pedido.itens.length > 1 && (
                                <p className="text-xs text-neutral-500">
                                    + {pedido.itens.length - 1} outros itens
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-bold text-neutral-900">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro.valorTotal)}
                            </span>
                            {pedido.financeiro.saldoPendente > 0 && (
                                <span className="text-[10px] text-red-500 font-medium">Pendente</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );

    return (
        <>
            {/* Mobile: Tab-based navigation */}
            <div className="md:hidden">
                {/* Column tabs */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2 scrollbar-thin">
                    {COLUMNS.map((col, index) => {
                        const count = pedidos.filter(p => p.status === col.id).length;
                        return (
                            <button
                                key={col.id}
                                onClick={() => setActiveColumnIndex(index)}
                                className={cn(
                                    "flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    activeColumnIndex === index
                                        ? "bg-primary text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                {col.shortLabel}
                                <span className={cn(
                                    "ml-1.5 px-1.5 py-0.5 rounded-full text-xs",
                                    activeColumnIndex === index
                                        ? "bg-white/20 text-white"
                                        : "bg-neutral-200 text-neutral-600"
                                )}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Navigation arrows */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => setActiveColumnIndex(Math.max(0, activeColumnIndex - 1))}
                        disabled={activeColumnIndex === 0}
                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 disabled:opacity-30"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-semibold text-neutral-800">{activeColumn.label}</h3>
                    <button
                        onClick={() => setActiveColumnIndex(Math.min(COLUMNS.length - 1, activeColumnIndex + 1))}
                        disabled={activeColumnIndex === COLUMNS.length - 1}
                        className="p-2 rounded-lg bg-neutral-100 text-neutral-600 disabled:opacity-30"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Active column cards */}
                <div
                    className="space-y-3 min-h-[400px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, activeColumn.id)}
                >
                    {activeColumnPedidos.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">
                            Nenhum pedido nesta etapa
                        </div>
                    ) : (
                        activeColumnPedidos.map(renderCard)
                    )}
                </div>
            </div>

            {/* Desktop: Horizontal scroll Kanban */}
            <div className="hidden md:flex overflow-x-auto pb-4 gap-4 min-h-[600px]">
                {COLUMNS.map((col) => {
                    const colPedidos = pedidos.filter(p => p.status === col.id);
                    return (
                        <div
                            key={col.id}
                            className="min-w-[280px] w-[280px] flex flex-col bg-neutral-50 rounded-lg p-2 border border-neutral-200"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="flex justify-between items-center mb-3 px-2 pt-2">
                                <h3 className="font-semibold text-sm text-neutral-700">{col.label}</h3>
                                <span className="bg-neutral-200 text-neutral-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                    {colPedidos.length}
                                </span>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                {colPedidos.map(renderCard)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
