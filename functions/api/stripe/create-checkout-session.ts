import Stripe from 'stripe';

interface Env {
    STRIPE_SECRET_KEY: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    STRIPE_PRICE_BASICO: string;
    STRIPE_PRICE_PROFISSIONAL: string;
    STRIPE_PRICE_PREMIUM: string;
}

const PLANS = {
    basico: { name: 'Básico', price: 49 },
    profissional: { name: 'Profissional', price: 99 },
    premium: { name: 'Premium', price: 199 },
};

const TRIAL_PERIOD_DAYS = 14;

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    });

    try {
        const body = await request.json() as { planId: string; userId: string; email: string };
        const { planId, userId, email } = body;

        if (!planId || !PLANS[planId as keyof typeof PLANS]) {
            return new Response(JSON.stringify({ error: 'Plano inválido' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (!userId || !email) {
            return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const priceId = env[`STRIPE_PRICE_${planId.toUpperCase()}` as keyof Env];
        const plan = PLANS[planId as keyof typeof PLANS];

        // Criar ou buscar customer
        const customers = await stripe.customers.list({ email, limit: 1 });
        let customerId: string;

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                email,
                metadata: { user_id: userId, source: 'web' },
            });
            customerId = customer.id;
        }

        // Criar Checkout Session
        const origin = new URL(request.url).origin;
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: {
                trial_period_days: TRIAL_PERIOD_DAYS,
                metadata: { user_id: userId, plan_name: plan.name },
            },
            success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout/cancel`,
            locale: 'pt-BR',
            billing_address_collection: 'required',
        });

        return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Erro ao criar checkout session:', error);
        return new Response(JSON.stringify({ error: 'Erro ao processar solicitação' }), {
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
