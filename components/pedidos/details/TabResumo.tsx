import { Pedido } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";

interface TabResumoProps {
    pedido: Pedido;
}

export function TabResumo({ pedido }: TabResumoProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Client & Delivery */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-neutral-800">{pedido.cliente.nome}</span>
                        </div>
                        <div className="space-y-2 text-sm text-neutral-600">
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                <span>{pedido.cliente.telefone}</span>
                            </div>
                            {pedido.cliente.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{pedido.cliente.email}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Entrega / Retirada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            {pedido.tipo === 'Entrega' ? '🚚 Entrega em Domicílio' : '🏪 Retirada no Local'}
                        </div>

                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-neutral-500" />
                                <span>{new Date(pedido.dataEntrega).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-neutral-500" />
                                <span>{pedido.horaEntrega}</span>
                            </div>
                        </div>

                        {pedido.tipo === 'Entrega' && pedido.entrega.endereco && (
                            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 text-neutral-500" />
                                    <div>
                                        <p className="font-medium text-neutral-800">
                                            {pedido.entrega.endereco.rua}, {pedido.entrega.endereco.numero}
                                        </p>
                                        <p className="text-neutral-600">
                                            {pedido.entrega.endereco.bairro} - {pedido.entrega.endereco.cidade}
                                        </p>
                                        {pedido.entrega.endereco.complemento && (
                                            <p className="text-neutral-500 text-xs mt-1">
                                                Comp: {pedido.entrega.endereco.complemento}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {pedido.entrega.instrucoes && (
                            <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg">
                                <strong>Instruções:</strong> {pedido.entrega.instrucoes}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Items & Values */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Itens do Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pedido.itens.map((item) => (
                            <div key={item.id} className="flex justify-between items-start border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                                <div>
                                    <p className="font-semibold text-neutral-800">
                                        {item.quantidade}x {item.nome}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {item.tamanho && `Tamanho: ${item.tamanho}`}
                                        {item.saborMassa && ` • Massa: ${item.saborMassa}`}
                                        {item.saborRecheio && ` • Recheio: ${item.saborRecheio}`}
                                    </p>
                                </div>
                                <span className="font-medium text-neutral-900">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {pedido.decoracao.descricao && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Decoração</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{pedido.decoracao.descricao}</p>
                            {pedido.decoracao.observacoes && (
                                <p className="text-xs text-neutral-500 mt-2 italic">Obs: {pedido.decoracao.observacoes}</p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Card className="bg-neutral-50">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600">Subtotal dos Itens</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.itens.reduce((acc, i) => acc + i.subtotal, 0))}</span>
                        </div>
                        {pedido.entrega.taxaEntrega > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">Taxa de Entrega</span>
                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.entrega.taxaEntrega)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-primary pt-2 border-t border-neutral-200 mt-2">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.financeiro.valorTotal)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

