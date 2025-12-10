"use client";

import { Pedido } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DollarSign, CreditCard, FileText, CheckCircle, AlertCircle } from "lucide-react";

interface TabFinanceiroProps {
    pedido: Pedido;
}

export function TabFinanceiro({ pedido }: TabFinanceiroProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Resumo Financeiro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-100 flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm text-neutral-600">
                                <span>Valor Total dos Produtos</span>
                                <span>{formatCurrency(pedido.itens.reduce((acc, i) => acc + i.subtotal, 0))}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-neutral-600">
                                <span>Taxa de Entrega</span>
                                <span>{formatCurrency(pedido.entrega.taxaEntrega)}</span>
                            </div>
                            {pedido.financeiro.valorPago > 0 && (
                                <div className="flex justify-between items-center text-sm text-green-600">
                                    <span>Valor Pago</span>
                                    <span>- {formatCurrency(pedido.financeiro.valorPago)}</span>
                                </div>
                            )}
                            <div className="border-t border-neutral-200 my-1 pt-2 flex justify-between items-center text-lg font-bold text-neutral-800">
                                <span>Total Geral</span>
                                <span>{formatCurrency(pedido.financeiro.valorTotal)}</span>
                            </div>

                            <div className={`mt-2 p-3 rounded-lg text-center font-bold border ${pedido.financeiro.saldoPendente <= 0
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {pedido.financeiro.saldoPendente <= 0
                                    ? 'PAGAMENTO QUITADO'
                                    : `RESTANTE A PAGAR: ${formatCurrency(pedido.financeiro.saldoPendente)}`
                                }
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm p-2 border-b">
                                <span className="text-neutral-600">Status do Pagamento</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${pedido.financeiro.statusPagamento === 'Pago' ? 'bg-green-100 text-green-700' :
                                    pedido.financeiro.statusPagamento === 'Parcial' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {pedido.financeiro.statusPagamento.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm p-2 border-b">
                                <span className="text-neutral-600">Forma de Pagamento</span>
                                <span className="font-medium">{pedido.financeiro.formaPagamento}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ações de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full justify-start" variant="outline">
                            <DollarSign className="mr-2 text-green-600" size={18} />
                            Registrar Pagamento
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 text-neutral-500" size={18} />
                            Gerar Comprovante / Recibo
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                            <AlertCircle className="mr-2 text-orange-500" size={18} />
                            Enviar Lembrete de Pagamento
                        </Button>
                    </CardContent>
                </Card>

                {pedido.financeiro.comprovante && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Comprovante Anexado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-400 text-sm border border-neutral-200">
                                Prévia do Comprovante
                            </div>
                            <Button variant="ghost" size="sm" className="w-full mt-2">Ver Comprovante Original</Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Helper to make TS happy if property does not exist in interface yet (mocking Sinal for logic)
// Extending Pedido locally for this component view if needed, but avoiding for now.
// Accessing strict properties.
interface ExtendedPedido extends Pedido {
    sinal?: number;
}
