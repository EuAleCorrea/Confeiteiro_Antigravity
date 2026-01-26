import Stripe from 'stripe';

// Cliente Stripe para uso no servidor
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

// Price IDs dos planos
export const STRIPE_PLANS = {
    basico: {
        priceId: process.env.STRIPE_PRICE_BASICO!,
        name: 'Básico',
        price: 49,
        features: ['Até 50 pedidos/mês', 'Gestão de clientes', 'Agenda básica', 'Suporte por email'],
    },
    profissional: {
        priceId: process.env.STRIPE_PRICE_PROFISSIONAL!,
        name: 'Profissional',
        price: 99,
        features: [
            'Pedidos ilimitados',
            'Controle de estoque',
            'Finanças completas',
            'WhatsApp integrado',
            'Relatórios avançados',
            'Suporte prioritário',
        ],
        highlighted: true,
    },
    premium: {
        priceId: process.env.STRIPE_PRICE_PREMIUM!,
        name: 'Premium',
        price: 199,
        features: [
            'Tudo do Profissional',
            'Multi-usuários',
            'API de integração',
            'Onboarding dedicado',
            'Suporte 24/7',
        ],
    },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

// Configurações de trial
export const TRIAL_PERIOD_DAYS = 14;
