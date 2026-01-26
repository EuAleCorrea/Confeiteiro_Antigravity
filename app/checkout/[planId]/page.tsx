import { STRIPE_PLANS } from "@/lib/stripe-config";
import CheckoutClient from "./CheckoutClient";

// Gerar parâmetros estáticos para todas as rotas de checkout
export function generateStaticParams() {
    return Object.keys(STRIPE_PLANS).map((planId) => ({ planId }));
}

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ planId: string }>;
}) {
    const { planId } = await params;
    return <CheckoutClient planId={planId} />;
}
