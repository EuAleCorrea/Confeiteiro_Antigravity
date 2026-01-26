"use client";

import { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";

interface CheckoutFormProps {
    planName: string;
    price: number;
}

export default function CheckoutForm({ planName, price }: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Pagamento confirmado!");
                    break;
                case "processing":
                    setMessage("Seu pagamento está sendo processado.");
                    break;
                case "requires_payment_method":
                    setMessage("Por favor, tente novamente.");
                    break;
                default:
                    setMessage("Algo deu errado.");
                    break;
            }
        });
    }, [stripe]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redireciona para a página de sucesso após o pagamento
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Ocorreu um erro inesperado");
        } else {
            setMessage("Ocorreu um erro inesperado.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                <h3 className="font-semibold text-[#3E2723] mb-2 text-sm uppercase tracking-wide">Resumo do Pedido</h3>
                <div className="flex justify-between items-center text-[#5D4037]">
                    <span>Plano {planName}</span>
                    <span className="font-bold">R${price},00/mês</span>
                </div>
                <p className="text-xs text-green-600 mt-1">✨ 14 dias de teste grátis incluídos</p>
            </div>

            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        Processando...
                    </>
                ) : (
                    <>
                        <Lock size={18} />
                        Assinar Agora
                    </>
                )}
            </button>

            {message && (
                <div id="payment-message" className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">
                    {message}
                </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                <Lock size={12} />
                <span>Pagamento seguro criptografado via Stripe</span>
            </div>
        </form>
    );
}
