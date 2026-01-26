import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    });

    try {
        const body = await request.json() as { customerId: string };
        const { customerId } = body;

        if (!customerId) {
            return new Response(JSON.stringify({ error: 'Customer ID não fornecido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const origin = new URL(request.url).origin;
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${origin}/dashboard/assinatura`,
        });

        return new Response(JSON.stringify({ url: portalSession.url }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Erro ao criar portal session:', error);
        return new Response(JSON.stringify({ error: 'Erro ao acessar portal' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
