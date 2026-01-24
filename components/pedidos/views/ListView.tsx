"use client";

import { Pedido } from "@/lib/storage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StatusBadge } from "../StatusBadge";
import { Button } from "@/components/ui/Button";
import { Eye, Edit, Calendar, Clock, MapPin, ChevronRight, DollarSign } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";

interface ListViewProps {
    pedidos: Pedido[];
    onPaymentConfirm?: (id: string) => void;
}

export function ListView({ pedidos, onPaymentConfirm }: ListViewProps) {
    if (pedidos.length === 0) {
        return (
            <div className="text-center py-12 text-text-secondary bg-white rounded-lg border border-border">
                Nenhum pedido encontrado.
            </div>
        );
    }

    return (
        <>
            {/* Mobile: Card-based list */}
            <div className="md:hidden space-y-3">
                {pedidos.map((pedido) => (
                    <Link key={pedido.id} href={`/pedidos/${pedido.id}`}>
                        <Card className="hover:shadow-md transition-shadow active:scale-[0.99]">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-neutral-800">#{pedido.numero}</span>
                                            <StatusBadge status={pedido.status} />
                                        </div>
                                        <p className="font-medium text-neutral-700 mt-1">{pedido.cliente.nome}</p>
                                        <p className="text-xs text-text-secondary">{pedido.cliente.telefone}</p>
                                    </div>
                                    <ChevronRight size={20} className="text-neutral-400 mt-1" />
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        <span>{new Date(pedido.dataEntrega).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        <span>{pedido.horaEntrega}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${pedido.tipo === 'Entrega' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {pedido.tipo}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                                    <div className="text-sm text-neutral-600">
                                        {pedido.itens.length} item(s)
                                    </div>
                                    <span className="font-bold text-neutral-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro.valorTotal)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Desktop: Table view */}
            <div className="hidden md:block bg-white rounded-lg border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Número</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Data Entrega</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Itens / Decoração</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pedidos.map((pedido) => (
                            <TableRow key={pedido.id}>
                                <TableCell className="font-medium">#{pedido.numero}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{pedido.cliente.nome}</span>
                                        <span className="text-xs text-text-secondary">{pedido.cliente.telefone}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{new Date(pedido.dataEntrega).toLocaleDateString()}</span>
                                        <span className="text-xs text-text-secondary">{pedido.horaEntrega}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-xs px-2 py-1 rounded-full ${pedido.tipo === 'Entrega' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {pedido.tipo}
                                    </span>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate" title={pedido.itens.map(i => i.nome).join(', ')}>
                                    <div className="flex flex-col gap-1">
                                        <span className="truncate text-sm">{pedido.itens.length} item(s): {pedido.itens[0]?.nome} {pedido.itens.length > 1 && `+${pedido.itens.length - 1}`}</span>
                                        {pedido.decoracao.descricao && (
                                            <span className="text-xs text-text-secondary truncate italic">Dec: {pedido.decoracao.descricao}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro.valorTotal)}
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={pedido.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {onPaymentConfirm && pedido.financeiro.statusPagamento !== 'Pago' && (
                                            <Button variant="ghost" size="sm" className="text-green-600" title="Confirmar Pagamento" onClick={() => onPaymentConfirm(pedido.id)}>
                                                <DollarSign size={16} />
                                            </Button>
                                        )}
                                        <Link href={`/pedidos/${pedido.id}`}>
                                            <Button variant="ghost" size="sm" title="Ver Detalhes">
                                                <Eye size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}


