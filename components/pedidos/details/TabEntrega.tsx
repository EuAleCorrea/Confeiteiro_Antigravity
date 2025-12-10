"use client";

import { Pedido } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MapPin, Navigation, User, Phone, CheckCircle } from "lucide-react";

interface TabEntregaProps {
    pedido: Pedido;
}

export function TabEntrega({ pedido }: TabEntregaProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Endereço e Rota</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pedido.tipo === 'Entrega' && pedido.entrega.endereco ? (
                            <>
                                <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                                    <MapPin className="text-primary mt-1" size={20} />
                                    <div>
                                        <p className="font-semibold text-neutral-800">
                                            {pedido.entrega.endereco.rua}, {pedido.entrega.endereco.numero}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {pedido.entrega.endereco.bairro}, {pedido.entrega.endereco.cidade} - {pedido.entrega.endereco.estado}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">CEP: {pedido.entrega.endereco.cep}</p>
                                    </div>
                                </div>

                                {/* Placeholder for Map */}
                                <div className="h-48 bg-neutral-100 rounded-lg flex items-center justify-center border border-neutral-200 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.550520,-46.633308&zoom=14&size=600x300&key=YOUR_API_KEY_PLACEHOLDER')] bg-cover bg-center opacity-50"></div>
                                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-medium text-sm text-neutral-700 z-10 flex items-center gap-2 shadow-sm">
                                        <Navigation size={16} /> Ver no Google Maps
                                    </div>
                                </div>

                                {pedido.entrega.distancia && (
                                    <div className="flex justify-between items-center text-sm text-neutral-700 px-2">
                                        <span>Distância Estimada:</span>
                                        <span className="font-bold">{pedido.entrega.distancia} km</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-neutral-500">
                                Pedido para Retirada na Loja
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Logística</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <span className="text-sm text-neutral-600">Motorista Responsável</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{pedido.entrega.motorista?.nome || 'Não definido'}</span>
                                {pedido.entrega.motorista && <User size={16} className="text-neutral-400" />}
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <span className="text-sm text-neutral-600">Horário Saída</span>
                            <span className="text-sm font-medium">{pedido.entrega.horarioSaida || '--:--'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Previsão Entrega</span>
                            <span className="text-sm font-medium">{pedido.horaEntrega}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Confirmação de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {pedido.status === 'Entregue' ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="font-bold text-green-800">Pedido Entregue!</h3>
                                <p className="text-sm text-green-700">
                                    Recebido por: <strong>{pedido.entrega.recebidoPor || 'Cliente'}</strong>
                                    <br />
                                    em {pedido.entrega.horarioEntrega || new Date(pedido.dataEntrega).toLocaleDateString()}
                                </p>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-4">
                                <p className="text-sm text-neutral-500">Aguardando entrega para registrar confirmação.</p>
                                <div className="border-2 border-dashed border-neutral-300 rounded-lg h-32 flex items-center justify-center bg-neutral-50 text-neutral-400 text-sm">
                                    Espaço para Foto / Assinatura
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {pedido.cliente.telefone && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded-full text-primary shadow-sm">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-primary-darker">Contatar Cliente</p>
                                    <p className="text-xs text-primary/70">Enviar atualização de entrega</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold uppercase tracking-wide bg-white text-primary px-3 py-1.5 rounded-full shadow-sm hover:shadow">
                                WhatsApp
                            </button>
                        </div>
                    </CardContent>
                </Card>
                )}
        </div>
        </div >
    );
}
