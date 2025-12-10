import { ProductionPlan } from "./calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

interface FillingCalculatorProps {
    plan: ProductionPlan;
}

export function FillingCalculator({ plan }: FillingCalculatorProps) {
    if (plan.recheios.length === 0) {
        return (
            <Card className="bg-blue-50/50 border-blue-100 h-full">
                <CardHeader><CardTitle className="text-blue-900">Calculadora de Recheios</CardTitle></CardHeader>
                <CardContent className="text-center py-8 text-blue-400 text-sm">
                    Nenhuma demanda de recheio identificada para o período.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-blue-50/50 border-blue-100 h-full">
            <CardHeader><CardTitle className="text-blue-900">Calculadora de Recheios</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {plan.recheios.map(recheio => (
                    <div key={recheio.receitaId} className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-neutral-800">{recheio.receitaNome}</h3>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{recheio.totalPanelas.toLocaleString('pt-BR')}</div>
                                <div className="text-xs text-neutral-500 uppercase tracking-wide">Panelas (~450g)</div>
                            </div>
                        </div>

                        <div className="mb-2 text-sm text-neutral-600">
                            Total Peso: <strong>{(recheio.totalPesoGramas / 1000).toFixed(2)}kg</strong>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-blue-100 hover:bg-transparent">
                                    <TableHead className="h-8 text-neutral-500 text-xs">Diâmetro</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right">Camadas</TableHead>
                                    <TableHead className="h-8 text-neutral-500 text-xs text-right">Peso (g)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recheio.detalhes.map(d => (
                                    <TableRow key={d.diametro} className="border-b-blue-50 hover:bg-blue-50/50">
                                        <TableCell className="py-2 font-medium">{d.diametro}cm</TableCell>
                                        <TableCell className="py-2 text-right">{d.camadas}</TableCell>
                                        <TableCell className="py-2 text-right font-bold text-blue-600">
                                            {d.pesoTotal}g
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
