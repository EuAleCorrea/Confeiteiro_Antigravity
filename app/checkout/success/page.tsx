"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, PartyPopper, Calendar, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular carregamento para dar tempo do webhook processar
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [sessionId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-[#5D4037]">Confirmando seu pagamento...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white flex items-center justify-center py-12">
            <div className="max-w-2xl mx-auto px-6 text-center">
                {/* Ícone de Sucesso */}
                <div className="relative mb-8">
                    <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={48} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
                        <PartyPopper className="text-yellow-600" size={24} />
                    </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl md:text-5xl font-black text-[#3E2723] mb-4">
                    Bem-vinda ao Confeiteiro!
                </h1>
                <p className="text-xl text-[#5D4037]/80 mb-8">
                    Sua assinatura foi confirmada com sucesso.
                    <br />
                    Agora você tem acesso a todas as funcionalidades do seu plano.
                </p>

                {/* Resumo */}
                <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8 text-left">
                    <h2 className="font-bold text-[#3E2723] mb-6">Próximos passos:</h2>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">1</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#3E2723]">Explore o Dashboard</p>
                                <p className="text-[#5D4037]/70 text-sm">
                                    Conheça todas as ferramentas disponíveis para você
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">2</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#3E2723]">Configure sua Conta</p>
                                <p className="text-[#5D4037]/70 text-sm">
                                    Adicione seus dados e personalize suas preferências
                                </p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-sm">3</span>
                            </div>
                            <div>
                                <p className="font-semibold text-[#3E2723]">Cadastre seus Produtos</p>
                                <p className="text-[#5D4037]/70 text-sm">
                                    Comece a adicionar seus bolos, doces e produtos
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Trial Info */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3">
                    <Calendar className="text-green-600" size={20} />
                    <span className="text-green-700 font-medium">
                        Seu período de teste termina em 14 dias
                    </span>
                </div>

                {/* CTA */}
                {/* CTA */}
                <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 w-full text-left">
                        <h3 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2">
                            <Mail size={20} className="text-blue-600" />
                            Verifique seu email
                        </h3>
                        <p className="text-[#5D4037]/80 text-sm mb-4">
                            Enviamos um link de acesso para <strong>{searchParams.get("email") || "seu email"}</strong>.
                            Clique nele para definir sua senha.
                        </p>
                        <p className="text-xs text-[#5D4037]/60">
                            Não recebeu? Verifique a caixa de spam ou acesse a página de login e clique em "Esqueci minha senha".
                        </p>
                    </div>

                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-lg w-full justify-center"
                    >
                        Ir para Login
                        <ArrowRight size={20} />
                    </Link>
                </div>

                <p className="text-sm text-[#5D4037]/60 mt-8">
                    Dúvidas? Entre em contato com nosso suporte.
                </p>
            </div>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
