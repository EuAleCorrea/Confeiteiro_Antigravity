"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STRIPE_PLANS, PlanKey } from "@/lib/stripe-config";
import { ChefHat, CheckCircle, Shield, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CheckoutClientProps {
    planId: string;
}

export default function CheckoutClient({ planId: initialPlanId }: CheckoutClientProps) {
    const router = useRouter();
    const [planId, setPlanId] = useState<PlanKey | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = `/login?redirect=/checkout/${planId}`;
                return;
            }

            const response = await fetch("/api/stripe/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId,
                    userId: user.id,
                    email: user.email,
                }),
            });

            const data = await response.json() as { error?: string; url?: string; sessionId?: string };

            if (!response.ok) {
                throw new Error(data.error || "Erro ao criar sessão de checkout");
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro inesperado");
            setIsLoading(false);
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

                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-[#3E2723] mb-6">
                                Finalizar Assinatura
                            </h2>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-[#5D4037]">
                                    <span>Plano {plan.name}</span>
                                    <span className="font-semibold">R${plan.price}/mês</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>14 dias grátis</span>
                                    <span className="font-semibold">-R${plan.price}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between text-[#3E2723]">
                                    <span className="font-bold">Total hoje</span>
                                    <span className="font-bold text-xl">R$0,00</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processando...
                                    </>
                                ) : (
                                    "Continuar para Pagamento"
                                )}
                            </button>

                            <p className="text-sm text-center text-[#5D4037]/60 mt-4">
                                Você será redirecionado para o Stripe para finalizar
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-[#5D4037]/60">
                            <Shield size={20} />
                            <span className="text-sm">
                                Pagamento seguro processado pelo Stripe
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
