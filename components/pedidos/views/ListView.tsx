"use client";

import { Pedido } from "@/lib/storage";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { StatusBadge } from "../StatusBadge";
import { Button } from "@/components/ui/Button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";

interface ListViewProps {
    pedidos: Pedido[];
}

export function ListView({ pedidos }: ListViewProps) {
    return (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
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
                    {pedidos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-text-secondary">
                                Nenhum pedido encontrado.
                            </TableCell>
                        </TableRow>
                    ) : (
                        pedidos.map((pedido) => (
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
                                        <Link href={`/pedidos/${pedido.id}`}>
                                            <Button variant="ghost" size="sm" title="Ver Detalhes">
                                                <Eye size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
