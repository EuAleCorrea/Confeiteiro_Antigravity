import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DollarSign, ShoppingBag, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-text-primary">Painel de Controle</h2>
                <p className="text-text-secondary">Visão geral da sua confeitaria hoje.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Vendas do Mês"
                    value="R$ 5.480,00"
                    change="+12% vs mês passado"
                    icon={TrendingUp}
                    variant="success"
                />
                <SummaryCard
                    title="Pedidos Pendentes"
                    value="8"
                    change="3 para hoje"
                    icon={ShoppingBag}
                    variant="warning"
                />
                <SummaryCard
                    title="Contas a Receber"
                    value="R$ 1.250,50"
                    change="Próx. vencimento: 10/12"
                    icon={AlertCircle}
                    variant="info"
                />
                <SummaryCard
                    title="Saldo Atual"
                    value="R$ 15.300,00"
                    change="Disponível"
                    icon={DollarSign}
                    variant="primary"
                />
            </div>

            {/* Recent Orders Placeholder */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Próximas Entregas</CardTitle>
                        <Button variant="ghost" size="sm">Ver tudo</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-neutral-50 text-text-secondary font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Pedido</th>
                                        <th className="px-4 py-3">Cliente</th>
                                        <th className="px-4 py-3">Entrega</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-surface">
                                    <tr className="hover:bg-neutral-50/50">
                                        <td className="px-4 py-3 font-medium">#1234</td>
                                        <td className="px-4 py-3">Ana Silva</td>
                                        <td className="px-4 py-3">Hoje, 16:00</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning-darker">A Fazer</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">R$ 150,00</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50/50">
                                        <td className="px-4 py-3 font-medium">#1235</td>
                                        <td className="px-4 py-3">Carlos Oliveira</td>
                                        <td className="px-4 py-3">Amanhã, 10:00</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-info/20 text-info-darker">Agendado</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">R$ 85,00</td>
                                    </tr>
                                    <tr className="hover:bg-neutral-50/50">
                                        <td className="px-4 py-3 font-medium">#1236</td>
                                        <td className="px-4 py-3">Mariana Costa</td>
                                        <td className="px-4 py-3">12/12/2024</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success-darker">Pago</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">R$ 320,00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, change, icon: Icon, variant }: any) {
    const colorClass = {
        primary: "text-primary bg-primary/10",
        success: "text-success bg-success/10",
        warning: "text-warning bg-warning/10",
        info: "text-info bg-info/10",
    }[variant as string] || "text-primary bg-primary/10";

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">{title}</p>
                        <p className="text-2xl font-bold text-text-primary">{value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-text-secondary">
                    <span className="font-medium">{change}</span>
                </div>
            </CardContent>
        </Card>
    );
}
