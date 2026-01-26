import { createClient } from "@/lib/supabase/server";
import { User, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Buscar perfil existente
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <h1 className="text-3xl font-bold text-[#3E2723] mb-2">Meu Perfil</h1>
            <p className="text-[#5D4037]/70 mb-8">Gerencie suas informações pessoais e de assinatura.</p>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="p-8 border-b border-stone-100 bg-[#FFFBF7]/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#3E2723]">
                                {profile?.full_name || "Usuário"}
                            </h2>
                            <p className="text-[#5D4037]/60 flex items-center gap-2">
                                <Mail size={14} /> {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <ProfileForm user={user} profile={profile} />
                </div>
            </div>
        </div>
    );
}
