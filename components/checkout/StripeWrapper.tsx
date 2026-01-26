"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Substitua pela sua chave pública do Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripeWrapperProps {
    planId: string;
    planName: string;
    price: number;
}

export default function StripeWrapper({ planId, planName, price }: StripeWrapperProps) {
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initPayment = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                // Tenta criar a assinatura via Edge Function
                const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-subscription`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({
                        priceId: planId, // Mapear para priceId real no backend ou passar direto se já for o ID
                        email: user?.email || "guest@example.com", // Idealmente coletar email antes se não logado
                        userId: user?.id
                    }),
                });

                if (!response.ok) {
                    // Se falhar (ex: função não existe), lançar erro específico
                    if (response.status === 404) {
                        throw new Error("Edge Function não encontrada. Configure o backend.");
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Erro ao iniciar pagamento");
                }

                const data = await response.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Erro no checkout:", err);
                setError(err instanceof Error ? err.message : "Erro desconhecido");
            } finally {
                setIsLoading(false);
            }
        };

        initPayment();
    }, [planId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-[#5D4037]">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p>Preparando checkout seguro...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-700 mb-2">Não foi possível carregar o pagamento</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <p className="text-sm text-gray-500">
                    Se você é o administrador, verifique se a Edge Function `create-subscription` foi deployada corretamente.
                </p>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#FF7F50', // Cor primária do Confeiteiro
            colorBackground: '#ffffff',
            colorText: '#3E2723',
            borderRadius: '12px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="w-full">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm planName={planName} price={price} />
                </Elements>
            )}
        </div>
    );
}
