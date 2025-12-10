"use client";

import { Pedido, storage } from "@/lib/storage";
import { StatusBadge } from "../StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, DollarSign, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";

interface KanbanViewProps {
    pedidos: Pedido[];
    onStatusChange: (pedidoId: string, newStatus: Pedido['status']) => void;
}

const COLUMNS: { id: Pedido['status']; label: string }[] = [
    { id: 'Pagamento Pendente', label: 'Pagamento Pendente' },
    { id: 'Aguardando Produção', label: 'Aguardando' },
    { id: 'Em Produção', label: 'Em Produção' },
    { id: 'Pronto', label: 'Pronto' },
    { id: 'Entregue', label: 'Entregue' },
];

export function KanbanView({ pedidos, onStatusChange }: KanbanViewProps) {
    const [draggingId, setDraggingId] = useState<string | null>(null);

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

    return (
        <div className="flex overflow-x-auto pb-4 gap-4 min-h-[600px]">
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
                            {colPedidos.map((pedido) => (
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
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
