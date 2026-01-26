// Configuração dos planos Stripe - apenas dados públicos
// Este arquivo é seguro para importar em componentes client-side

// Price IDs dos planos (valores públicos, podem ser expostos)
export const STRIPE_PLANS = {
    basico: {
        priceId: 'price_basico', // Placeholder - será substituído via API
        name: 'Básico',
        price: 49,
        features: ['Até 50 pedidos/mês', 'Gestão de clientes', 'Agenda básica', 'Suporte por email'],
    },
    profissional: {
        priceId: 'price_profissional', // Placeholder - será substituído via API
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
        priceId: 'price_premium', // Placeholder - será substituído via API
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
