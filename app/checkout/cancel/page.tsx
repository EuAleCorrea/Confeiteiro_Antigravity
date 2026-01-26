"use client";

import Link from "next/link";
import { XCircle, ArrowLeft, MessageCircle, RefreshCw } from "lucide-react";

export default function CheckoutCancelPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white flex items-center justify-center py-12">
            <div className="max-w-xl mx-auto px-6 text-center">
                {/* Ícone */}
                <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-8">
                    <XCircle className="text-yellow-600" size={40} />
                </div>

                {/* Título */}
                <h1 className="text-3xl md:text-4xl font-black text-[#3E2723] mb-4">
                    Processo Cancelado
                </h1>
                <p className="text-lg text-[#5D4037]/80 mb-8">
                    Você cancelou o processo de assinatura.
                    Não se preocupe, nenhum valor foi cobrado.
                </p>

                {/* Opções */}
                <div className="space-y-4">
                    <Link
                        href="/#precos"
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-full transition-all hover:scale-[1.02]"
                    >
                        <RefreshCw size={20} />
                        Tentar Novamente
                    </Link>

                    <Link
                        href="/"
                        className="w-full inline-flex items-center justify-center gap-2 bg-white border-2 border-[#5D4037]/20 text-[#5D4037] font-semibold py-4 px-6 rounded-full hover:border-primary hover:text-primary transition-all"
                    >
                        <ArrowLeft size={20} />
                        Voltar ao Início
                    </Link>
                </div>

                {/* Ajuda */}
                <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100">
                    <h3 className="font-semibold text-[#3E2723] mb-2">
                        Precisa de ajuda?
                    </h3>
                    <p className="text-sm text-[#5D4037]/70 mb-4">
                        Se você teve algum problema durante o pagamento ou tem dúvidas sobre os planos, entre em contato conosco.
                    </p>
                    <Link
                        href="/contato"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                        <MessageCircle size={18} />
                        Falar com Suporte
                    </Link>
                </div>
            </div>
        </main>
    );
}
