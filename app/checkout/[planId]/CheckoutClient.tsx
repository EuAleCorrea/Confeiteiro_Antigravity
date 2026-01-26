"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STRIPE_PLANS, PlanKey } from "@/lib/stripe-config";
import { ChefHat, CheckCircle, Shield, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import Link from "next/link";

// Payment Links do Stripe - Checkout hospedado pelo Stripe (mais estável)
const PAYMENT_LINKS: Record<PlanKey, string> = {
    basico: 'https://buy.stripe.com/test_00w8wP1KwbL97DP0lqbfO03',
    profissional: 'https://buy.stripe.com/test_eVqeVd2OA8yX9LX5FKbfO04',
    premium: 'https://buy.stripe.com/test_6oU4gz2OA9D1bU5b04bfO05',
};

interface CheckoutClientProps {
    planId: string;
}

export default function CheckoutClient({ planId: initialPlanId }: CheckoutClientProps) {
    const router = useRouter();
    const [planId, setPlanId] = useState<PlanKey | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialPlanId in STRIPE_PLANS) {
            setPlanId(initialPlanId as PlanKey);
        } else {
            router.push("/");
        }
    }, [initialPlanId, router]);

    if (!planId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const plan = STRIPE_PLANS[planId];

    const handleCheckout = () => {
        setIsLoading(true);
        const paymentLink = PAYMENT_LINKS[planId];
        if (paymentLink) {
            window.location.href = paymentLink;
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#FFFBF7] to-white py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="mb-8">
                    <Link
                        href="/#precos"
                        className="inline-flex items-center gap-2 text-[#5D4037] hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Voltar para planos
                    </Link>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Resumo do Plano */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <ChefHat className="text-primary" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#3E2723]">
                                    Plano {plan.name}
                                </h1>
                                <p className="text-[#5D4037]/70">Confeiteiro Pro</p>
                            </div>
                        </div>

                        <div className="border-t border-b border-gray-100 py-6 my-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-[#3E2723]">
                                    R${plan.price}
                                </span>
                                <span className="text-[#5D4037]/70">/mês</span>
                            </div>
                            <p className="text-sm text-green-600 mt-2 font-medium">
                                ✨ 14 dias grátis para testar
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-[#3E2723]">Incluso no plano:</h3>
                            <ul className="space-y-3">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle
                                            size={18}
                                            className="text-primary mt-0.5 flex-shrink-0"
                                        />
                                        <span className="text-[#5D4037]">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Área de Checkout */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                                Finalizar Assinatura
                            </h2>

                            <div className="space-y-6">
                                {/* Informações de segurança */}
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="text-green-600 mt-0.5" size={20} />
                                        <div>
                                            <p className="font-medium text-green-800">
                                                Pagamento 100% Seguro
                                            </p>
                                            <p className="text-sm text-green-700 mt-1">
                                                Você será redirecionado para a página segura do Stripe para inserir seus dados de pagamento.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Resumo de valores */}
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex justify-between text-sm text-[#5D4037] mb-2">
                                        <span>Plano {plan.name}</span>
                                        <span>R$ {plan.price}/mês</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600 mb-4">
                                        <span>Período de teste</span>
                                        <span>14 dias grátis</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-[#3E2723] text-lg border-t border-gray-100 pt-4">
                                        <span>Total hoje</span>
                                        <span>R$ 0,00</span>
                                    </div>
                                    <p className="text-xs text-[#5D4037]/60 mt-2">
                                        A cobrança de R$ {plan.price} ocorrerá após 14 dias
                                    </p>
                                </div>

                                {/* Botão de Checkout */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirecionando...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={20} />
                                            Começar Teste Grátis
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-center text-[#5D4037]/60">
                                    Ao clicar, você concorda com os{" "}
                                    <Link href="/termos" className="underline hover:text-primary">
                                        Termos de Uso
                                    </Link>{" "}
                                    e{" "}
                                    <Link href="/privacidade" className="underline hover:text-primary">
                                        Política de Privacidade
                                    </Link>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-[#5D4037]/60">
                            <Shield size={20} />
                            <span className="text-sm">
                                Ambiente seguro e criptografado
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
