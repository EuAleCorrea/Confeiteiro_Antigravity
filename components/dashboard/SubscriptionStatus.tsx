"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Subscription {
    status: string;
    plan_name: string;
    trial_end: string | null;
    current_period_end: string;
}

export function SubscriptionStatus() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from("subscriptions")
                    .select("status, plan_name, trial_end, current_period_end")
                    .eq("user_id", user.id)
                    .in("status", ["active", "trialing", "past_due"])
                    .single();
                setSubscription(data);
            }
            setLoading(false);
        }
        fetch();
    }, []);

    if (loading) return null;

    if (!subscription) {
        return (
            <Link
                href="/#precos"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl hover:from-primary/20 hover:to-primary/10 transition-colors"
            >
                <Crown className="text-primary" size={20} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#3E2723]">Assine Agora</p>
                    <p className="text-xs text-[#5D4037]/70 truncate">14 dias grátis</p>
                </div>
            </Link>
        );
    }

    const isTrialing = subscription.status === "trialing";
    const isPastDue = subscription.status === "past_due";
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
    const daysLeft = trialEnd
        ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

    if (isPastDue) {
        return (
            <Link
                href="/dashboard/assinatura"
                className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
                <AlertTriangle className="text-red-600" size={20} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-red-800">Pagamento Pendente</p>
                    <p className="text-xs text-red-600">Clique para resolver</p>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href="/dashboard/assinatura"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
        >
            {isTrialing ? (
                <Clock className="text-blue-600" size={20} />
            ) : (
                <Crown className="text-primary" size={20} />
            )}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3E2723]">
                    {subscription.plan_name}
                </p>
                <p className="text-xs text-[#5D4037]/70 truncate">
                    {isTrialing ? `${daysLeft} dias de trial` : "Assinatura ativa"}
                </p>
            </div>
        </Link>
    );
}
