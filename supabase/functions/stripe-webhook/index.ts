import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const signature = req.headers.get("Stripe-Signature");
    const body = await req.text();
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    try {
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            endpointSecret!,
            undefined,
            Stripe.createSubtleCryptoProvider()
        );

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(`🔔 Evento recebido: ${event.type}`);

        switch (event.type) {
            case "checkout.session.completed":
            case "customer.subscription.created": {
                const session = event.data.object as any;
                const email = session.customer_details?.email || session.email || session.customer_email;
                const customerId = session.customer as string;

                console.log(`💰 Pagamento confirmado para: ${email}`);

                // 1. Criar ou buscar usuário no Supabase Auth
                // Usamos inviteUserByEmail para criar E enviar email de convite (para definir senha)
                const { data: userData, error: userError } = await supabase.auth.admin.inviteUserByEmail(email, {
                    data: {
                        stripe_customer_id: customerId,
                        role: 'subscriber'
                    }
                });

                if (userError) {
                    if (userError.message.includes("already exists")) {
                        console.log("👤 Usuário já existe, atualizando metadados.");
                        // Se já existe, apenas garantimos que o stripe_id está lá
                        const { data: existingUser } = await supabase.auth.admin.listUsers();
                        const user = existingUser.users.find(u => u.email === email);
                        if (user) {
                            await supabase.auth.admin.updateUserById(user.id, {
                                user_metadata: { ...user.user_metadata, stripe_customer_id: customerId }
                            });
                        }
                    } else {
                        throw userError;
                    }
                } else {
                    console.log(`✅ Novo usuário criado: ${userData.user.id}`);
                    // 2. Aqui você pode disparar um email de boas-vindas/reset de senha via Supabase
                    await supabase.auth.admin.generateLink({
                        type: 'recovery',
                        email: email,
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as any;
                console.log(`❌ Assinatura cancelada para o customer: ${subscription.customer}`);
                // Logica para desativar acesso se necessário
                break;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error(`❌ Erro no Webhook: ${error.message}`);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
