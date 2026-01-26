import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

interface Env {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-12-15.clover',
    });

    const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400 });
    }

    let event: Stripe.Event;

    try {
        if (env.STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
        } else {
            event = JSON.parse(body) as Stripe.Event;
        }
    } catch (err) {
        console.error('Erro ao validar webhook:', err);
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }

    console.log(`📩 Webhook recebido: ${event.type}`);

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = event.data.object as any;

        switch (event.type) {
            case 'checkout.session.completed': {
                const userId = data.metadata?.user_id;
                const subscriptionId = data.subscription as string;
                if (userId && subscriptionId) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
                    await supabase.from('subscriptions').upsert({
                        user_id: userId,
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: data.customer,
                        stripe_price_id: subscription.items?.data?.[0]?.price?.id || '',
                        plan_name: subscription.metadata?.plan_name || 'Plano',
                        status: subscription.status || 'incomplete',
                        current_period_start: subscription.current_period_start
                            ? new Date(subscription.current_period_start * 1000).toISOString()
                            : new Date().toISOString(),
                        current_period_end: subscription.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toISOString()
                            : new Date().toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                        trial_end: subscription.trial_end
                            ? new Date(subscription.trial_end * 1000).toISOString()
                            : null,
                    }, { onConflict: 'stripe_subscription_id' });
                }
                break;
            }

            case 'invoice.payment_succeeded': {
                if (data.subscription) {
                    await supabase.from('subscriptions').update({ status: 'active' })
                        .eq('stripe_subscription_id', data.subscription);
                }
                break;
            }

            case 'invoice.payment_failed': {
                if (data.subscription) {
                    await supabase.from('subscriptions').update({ status: 'past_due' })
                        .eq('stripe_subscription_id', data.subscription);
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                await supabase.from('subscriptions').update({
                    status: event.type === 'customer.subscription.deleted' ? 'canceled' : data.status,
                    stripe_price_id: data.items?.data?.[0]?.price?.id || '',
                    current_period_start: data.current_period_start
                        ? new Date(data.current_period_start * 1000).toISOString()
                        : new Date().toISOString(),
                    current_period_end: data.current_period_end
                        ? new Date(data.current_period_end * 1000).toISOString()
                        : new Date().toISOString(),
                    cancel_at_period_end: data.cancel_at_period_end || false,
                }).eq('stripe_subscription_id', data.id);
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        return new Response(JSON.stringify({ error: 'Webhook handler failed' }), { status: 500 });
    }
};
