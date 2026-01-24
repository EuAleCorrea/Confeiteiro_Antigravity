import { Pedido } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/Card";

interface TabHistoricoProps {
    pedido: Pedido;
}

export function TabHistorico({ pedido }: TabHistoricoProps) {
    // Sort history by date descending
    const historico = [...pedido.historico].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                    {historico.map((evento, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Icon / Dot */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-neutral-100 group-hover:bg-primary/10 transition-colors shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                <span className="w-3 h-3 bg-primary rounded-full"></span>
                            </div>

                            {/* Card Info */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white border border-neutral-100 rounded-xl shadow-sm">
                                <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-neutral-800">{evento.acao}</div>
                                    <time className="font-mono text-xs text-neutral-500">{new Date(evento.data).toLocaleString()}</time>
                                </div>
                                <div className="text-sm text-neutral-600">
                                    Usuário: <span className="font-medium">{evento.usuario}</span>
                                </div>
                                {evento.detalhes && (
                                    <div className="mt-2 text-xs bg-neutral-50 p-2 rounded text-neutral-500">
                                        {evento.detalhes}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

