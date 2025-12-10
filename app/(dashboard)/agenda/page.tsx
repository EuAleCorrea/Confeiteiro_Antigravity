"use client";

import { useEffect, useState } from "react";
import { storage, Pedido } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Truck, Store, CheckCircle, Navigation, Clock } from "lucide-react";
import { StatusBadge } from "@/components/pedidos/StatusBadge";
import Link from "next/link";

export default function AgendaPage() {
    const [date, setDate] = useState(new Date());
    const [pedidos, setPedidos] = useState<Pedido[]>([]);

    useEffect(() => {
        loadDailyPedidos();
    }, [date]);

    const loadDailyPedidos = () => {
        const all = storage.getPedidos();
        const daily = all.filter(p => {
            const pDate = new Date(p.dataEntrega);
            return pDate.toDateString() === date.toDateString();
        });
        // Sort by time
        daily.sort((a, b) => a.horaEntrega.localeCompare(b.horaEntrega));
        setPedidos(daily);
    };

    const handleNextDay = () => {
        const next = new Date(date);
        next.setDate(date.getDate() + 1);
        setDate(next);
    };

    const handlePrevDay = () => {
        const prev = new Date(date);
        prev.setDate(date.getDate() - 1);
        setDate(prev);
    };

    const entregas = pedidos.filter(p => p.tipo === 'Entrega');
    const retiradas = pedidos.filter(p => p.tipo === 'Retirada');

    return (
        <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
            {/* Header with Date Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-800">Agenda Diária</h1>
                    <p className="text-neutral-500 text-sm">Logística e Entregas</p>
                </div>
                <div className="flex items-center gap-4 bg-neutral-50 p-1 rounded-lg">
                    <Button variant="ghost" onClick={handlePrevDay}>&larr;</Button>
                    <div className="text-center min-w-[150px]">
                        <p className="font-bold text-neutral-800 capitalize">
                            {date.toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </p>
                        <p className="text-sm text-neutral-500">
                            {date.toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                    <Button variant="ghost" onClick={handleNextDay}>&rarr;</Button>
                </div>
                <Button variant="primary" onClick={() => setDate(new Date())}>Hoje</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Route Optimization (Deliveries) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2 text-primary-darker">
                                    <Truck size={20} /> Rota de Entrega Otimizada
                                </CardTitle>
                                <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                                    {entregas.length} Entregas
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            {/* Map Placeholder */}
                            <div className="h-64 bg-neutral-100 w-full relative group overflow-hidden border-b border-neutral-200">
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-400 bg-neutral-200/50">
                                    <MapPin size={48} className="opacity-20" />
                                    <span className="ml-2 font-medium">Mapa de Roteirização (Google Maps)</span>
                                </div>
                                <div className="absolute bottom-4 right-4">
                                    <Button variant="primary" size="sm" className="shadow-lg">
                                        <Navigation size={16} className="mr-2" /> Iniciar Navegação
                                    </Button>
                                </div>
                            </div>

                            {/* Delivery Timeline */}
                            <div className="p-6 space-y-6">
                                {entregas.length === 0 ? (
                                    <div className="text-center py-8 text-neutral-500">
                                        Nenhuma entrega agendada para este dia.
                                    </div>
                                ) : (
                                    entregas.map((pedido, idx) => (
                                        <div key={pedido.id} className="relative flex gap-4 group">
                                            {/* Connector Line */}
                                            {idx !== entregas.length - 1 && (
                                                <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-neutral-200 group-hover:bg-primary/30 transition-colors"></div>
                                            )}

                                            {/* Number/Icon */}
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-neutral-600 shrink-0 z-10 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {idx + 1}
                                            </div>

                                            {/* Card */}
                                            <Link href={`/pedidos/${pedido.id}`} className="flex-1 block">
                                                <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-bold text-neutral-800">{pedido.cliente.nome}</h4>
                                                            <p className="text-sm text-neutral-600 flex items-center gap-1">
                                                                <MapPin size={14} /> {pedido.entrega.endereco?.bairro || 'Endereço não informado'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center gap-1 text-primary font-bold">
                                                                <Clock size={16} /> {pedido.horaEntrega}
                                                            </div>
                                                            <StatusBadge status={pedido.status} />
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-neutral-500 mt-2 bg-neutral-50 p-2 rounded">
                                                        Itens: {pedido.itens.map(i => `${i.quantidade}x ${i.nome}`).join(', ')}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Pickups & Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="bg-orange-50 border-b border-orange-100">
                            <CardTitle className="flex items-center gap-2 text-orange-800">
                                <Store size={20} /> Retiradas na Loja
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {retiradas.length === 0 ? (
                                <div className="text-center py-6 text-neutral-500 text-sm">
                                    Nenhuma retirada agendada.
                                </div>
                            ) : (
                                retiradas.map(pedido => (
                                    <Link key={pedido.id} href={`/pedidos/${pedido.id}`}>
                                        <div className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-lg hover:border-orange-300 transition-colors shadow-sm">
                                            <div className="flex flex-col items-center bg-orange-100 text-orange-700 px-2 py-1 rounded min-w-[60px]">
                                                <span className="text-xs font-bold uppercase">Hora</span>
                                                <span className="text-lg font-black">{pedido.horaEntrega}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-neutral-800 truncate">{pedido.cliente.nome}</p>
                                                <p className="text-xs text-neutral-500 truncate">#{pedido.numero} • {pedido.itens.length} itens</p>
                                            </div>
                                            <StatusBadge status={pedido.status} />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-800 text-white">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-lg mb-2">Resumo do Dia</h3>
                            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
                                <span className="text-neutral-400">Total de Pedidos</span>
                                <span className="text-2xl font-bold">{pedidos.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
                                <span className="text-neutral-400">A Entregar</span>
                                <span className="text-xl font-bold">{entregas.length}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
                                <span className="text-neutral-400">A Retirar</span>
                                <span className="text-xl font-bold">{retiradas.length}</span>
                            </div>
                            <div className="pt-2">
                                <Button className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-bold">
                                    <CheckCircle size={18} className="mr-2" /> Fechar Dia
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
