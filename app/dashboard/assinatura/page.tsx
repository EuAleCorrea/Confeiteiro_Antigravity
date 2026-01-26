"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    CreditCard,
    Calendar,
    CheckCircle,
    AlertCircle,
    ExternalLink,
    Loader2,
    Crown,
    Clock,
} from "lucide-react";
import Link from "next/link";

interface Subscription {
    id: string;
    plan_name: string;
    status: string;
    current_period_end: string;
    trial_end: string | null;
    cancel_at_period_end: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "Ativa", color: "text-green-600 bg-green-100", icon: CheckCircle },
    trialing: { label: "Em Trial", color: "text-blue-600 bg-blue-100", icon: Clock },
    past_due: { label: "Pagamento Pendente", color: "text-yellow-600 bg-yellow-100", icon: AlertCircle },
    canceled: { label: "Cancelada", color: "text-red-600 bg-red-100", icon: AlertCircle },
    incomplete: { label: "Incompleta", color: "text-gray-600 bg-gray-100", icon: AlertCircle },
};

export default function AssinaturaPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [portalLoading, setPortalLoading] = useState(false);

    useEffect(() => {
        fetchSubscription();
    }, []);

    async function fetchSubscription() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .in("status", ["active", "trialing", "past_due"])
            .single();

        setSubscription(data);
        setLoading(false);
    }

    async function handlePortalAccess() {
        setPortalLoading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            // Buscar stripe_customer_id
            const { data: customerData } = await supabase
                .from("stripe_customers")
                .select("stripe_customer_id")
                .eq("user_id", user.id)
                .single();

            if (!customerData?.stripe_customer_id) {
                console.error("Customer não encontrado");
                setPortalLoading(false);
                return;
            }

            const response = await fetch("/api/stripe/customer-portal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: customerData.stripe_customer_id }),
            });
            const data = await response.json() as { url?: string; error?: string };
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Erro ao acessar portal:", error);
        }
        setPortalLoading(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Crown className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[#3E2723] mb-4">
                        Você ainda não tem uma assinatura
                    </h1>
                    <p className="text-[#5D4037]/70 mb-6">
                        Escolha um plano para ter acesso a todas as funcionalidades do Confeiteiro.
                    </p>
                    <Link
                        href="/#precos"
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105"
                    >
                        Ver Planos
                    </Link>
                </div>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.incomplete;
    const StatusIcon = statusConfig.icon;
    const periodEnd = new Date(subscription.current_period_end);
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
    const isTrialing = subscription.status === "trialing";

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#3E2723]">Minha Assinatura</h1>
                <p className="text-[#5D4037]/70">Gerencie seu plano e pagamentos</p>
            </div>

            {/* Card Principal */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Crown className="text-primary" size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#3E2723]">
                                Plano {subscription.plan_name}
                            </h2>
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                                <StatusIcon size={14} />
                                {statusConfig.label}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {isTrialing && trialEnd && (
                        <div className="bg-blue-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                <Clock size={18} />
                                <span className="font-medium">Período de Trial</span>
                            </div>
                            <p className="text-blue-900 font-semibold">
                                Termina em {trialEnd.toLocaleDateString("pt-BR")}
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                {Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias restantes
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-[#5D4037] mb-1">
                            <Calendar size={18} />
                            <span className="font-medium">Próxima Cobrança</span>
                        </div>
                        <p className="text-[#3E2723] font-semibold">
                            {periodEnd.toLocaleDateString("pt-BR")}
                        </p>
                        {subscription.cancel_at_period_end && (
                            <p className="text-sm text-red-600 mt-1">
                                Assinatura será cancelada nesta data
                            </p>
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handlePortalAccess}
                        disabled={portalLoading}
                        className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-[1.02] disabled:opacity-70"
                    >
                        {portalLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <CreditCard size={18} />
                        )}
                        Gerenciar Assinatura
                    </button>

                    <a
                        href="https://dashboard.stripe.com/test/invoices"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#5D4037] font-semibold px-6 py-3 rounded-full hover:border-primary hover:text-primary transition-all"
                    >
                        <ExternalLink size={18} />
                        Ver Faturas
                    </a>
                </div>
            </div>

            {/* Info adicional */}
            <div className="bg-[#FFFBF7] rounded-2xl p-6 border border-[#5D4037]/10">
                <h3 className="font-semibold text-[#3E2723] mb-2">
                    Sobre sua assinatura
                </h3>
                <ul className="space-y-2 text-sm text-[#5D4037]/80">
                    <li>• Você pode cancelar ou alterar seu plano a qualquer momento</li>
                    <li>• Ao cancelar, você mantém acesso até o fim do período pago</li>
                    <li>• Pagamentos são processados de forma segura pelo Stripe</li>
                </ul>
            </div>
        </div>
    );
}
