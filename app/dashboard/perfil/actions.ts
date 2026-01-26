"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Usuário não autenticado." };
    }

    const full_name = formData.get("full_name") as string;
    const cpf = formData.get("cpf") as string;
    const phone = formData.get("phone") as string;

    // Validação básica
    if (!full_name || full_name.length < 3) {
        return { error: "Nome completo é obrigatório." };
    }
    if (!cpf) {
        return { error: "CPF é obrigatório." };
    }
    if (!phone) {
        return { error: "Telefone é obrigatório." };
    }

    const { error } = await supabase
        .from("profiles")
        .upsert({
            id: user.id,
            full_name,
            cpf,
            phone,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) {
        console.error("Erro ao atualizar perfil:", error);
        return { error: "Erro ao salvar perfil. Tente novamente." };
    }

    revalidatePath("/dashboard/perfil");
    revalidatePath("/dashboard");
    return { success: "Perfil atualizado com sucesso!" };
}
