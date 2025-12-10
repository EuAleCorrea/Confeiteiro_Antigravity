import { ProductionPlan } from "./calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";

interface ShoppingListProps {
    plan: ProductionPlan;
}

export function ShoppingList({ plan }: ShoppingListProps) {
    const [lowStockItems, setLowStockItems] = useState<import("@/lib/storage").Ingrediente[]>([]);

    useEffect(() => {
        // Run only on client mount
        const all = storage.getIngredientes();
        const low = all.filter(i => (i.estoqueAtual || 0) <= i.estoqueMinimo);
        setLowStockItems(low);
    }, []);

    const hasProductionItems = plan.listaCompras.length > 0;
    const hasLowStockItems = lowStockItems.length > 0;

    if (!hasProductionItems && !hasLowStockItems) {
        return (
            <Card className="h-full">
                <CardHeader><CardTitle>Lista de Compras</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-neutral-400 text-sm">
                    Nenhum item necessário para compra no momento.
                </CardContent>
            </Card>
        );
    }

    // Group Production List by Category
    const byCategory = plan.listaCompras.reduce((acc, item) => {
        const cat = item.ingrediente.categoria;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, typeof plan.listaCompras>);

    return (
        <div className="space-y-8">
            {hasProductionItems && (
                <Card className="h-full">
                    <CardHeader><CardTitle>Lista de Compras (Produção)</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {Object.entries(byCategory).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                                        <Badge className="bg-neutral-50 text-neutral-800 border-neutral-200">{category}</Badge>
                                    </h3>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="h-8 text-neutral-500 text-xs pl-0">Ingrediente</TableHead>
                                                <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0">Qtd. Necessária</TableHead>
                                                <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0 w-[100px]">Estoque</TableHead>
                                                <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0 w-[100px]">A Comprar</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, idx) => {
                                                const stock = item.ingrediente.estoqueAtual || 0;
                                                const needs = item.quantidadeTotal;
                                                const toBuy = Math.max(0, needs - stock);

                                                return (
                                                    <TableRow key={idx} className="border-b-neutral-100 last:border-0 hover:bg-neutral-50/50">
                                                        <TableCell className="py-2 pl-0 font-medium text-neutral-700">
                                                            {item.ingrediente.nome}
                                                        </TableCell>
                                                        <TableCell className="py-2 pr-0 text-right">
                                                            {needs.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {item.ingrediente.unidade}
                                                        </TableCell>
                                                        <TableCell className="py-2 pr-0 text-right text-neutral-500">
                                                            {stock} {item.ingrediente.unidade}
                                                        </TableCell>
                                                        <TableCell className="py-2 pr-0 text-right font-bold">
                                                            {toBuy > 0 ? (
                                                                <span className="text-red-500">{toBuy.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} {item.ingrediente.unidade}</span>
                                                            ) : (
                                                                <span className="text-green-500">OK</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {hasLowStockItems && (
                <Card className="border-yellow-200 bg-yellow-50/20">
                    <CardHeader>
                        <CardTitle className="text-yellow-800 flex items-center gap-2">
                            ⚠️ Reposição de Estoque (Mínimo Atingido)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="h-8 text-neutral-500 text-xs pl-0">Ingrediente</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0">Estoque Atual</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0">Mínimo</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right pr-0">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lowStockItems.map(ing => (
                                    <TableRow key={ing.id} className="border-b-yellow-100 last:border-0 hover:bg-yellow-50">
                                        <TableCell className="py-2 pl-0 font-medium text-neutral-800">{ing.nome}</TableCell>
                                        <TableCell className="py-2 pr-0 text-right font-bold text-red-600">
                                            {ing.estoqueAtual} {ing.unidade}
                                        </TableCell>
                                        <TableCell className="py-2 pr-0 text-right text-neutral-600">
                                            {ing.estoqueMinimo} {ing.unidade}
                                        </TableCell>
                                        <TableCell className="py-2 pr-0 text-right text-xs text-yellow-700">
                                            {ing.estoqueAtual === 0 ? 'Zerado' : 'Abaixo do Mínimo'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
