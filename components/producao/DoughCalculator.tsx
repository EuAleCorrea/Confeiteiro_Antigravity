import { ProductionPlan } from "./calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface DoughCalculatorProps {
    plan: ProductionPlan;
}

export function DoughCalculator({ plan }: DoughCalculatorProps) {
    if (plan.massas.length === 0) {
        return (
            <Card className="bg-orange-50/50 border-orange-100 h-full">
                <CardHeader><CardTitle className="text-orange-900">Calculadora de Massas</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-orange-400 text-sm">
                    Nenhuma demanda de massa identificada para o período.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-orange-50/50 border-orange-100 h-full">
            <CardHeader><CardTitle className="text-orange-900">Calculadora de Massas</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {plan.massas.map(massa => (
                    <div key={massa.receitaId} className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-neutral-800">{massa.receitaNome}</h3>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-orange-600">{massa.totalLotes.toLocaleString('pt-BR')}</div>
                                <div className="text-xs text-neutral-500 uppercase tracking-wide">Receitas (Batidas)</div>
                            </div>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-orange-100 hover:bg-transparent">
                                    <TableHead className="h-8 text-neutral-500 text-xs">Diâmetro</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right">Discos Necessários</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right">Lotes Necessários</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {massa.detalhes.map(d => (
                                    <TableRow key={d.diametro} className="border-b-orange-50 hover:bg-orange-50/50">
                                        <TableCell className="py-2 font-medium">{d.diametro}cm</TableCell>
                                        <TableCell className="py-2 text-right">{d.qtdDiscos}</TableCell>
                                        <TableCell className="py-2 text-right font-bold text-orange-600">
                                            {d.lotes.toFixed(1)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
