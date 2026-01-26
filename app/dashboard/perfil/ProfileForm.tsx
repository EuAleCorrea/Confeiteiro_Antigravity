"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { User, Phone, FileText, Loader2, Save, CheckCircle2 } from "lucide-react";

interface ProfileFormProps {
    user: any;
    profile: any;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setMessage(null);

        try {
            const result = await updateProfile(formData);

            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else if (result.success) {
                setMessage({ type: 'success', text: result.success });
            }
        } catch (error) {
            setMessage({ type: 'error', text: "Erro inesperado. Tente novamente." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl">
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <Loader2 size={20} />}
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                        Nome Completo
                    </label>
                    <div className="relative">
                        <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            name="full_name"
                            defaultValue={profile?.full_name || ""}
                            placeholder="Seu nome completo"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#5D4037] mb-2">
                            CPF
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="cpf"
                                defaultValue={profile?.cpf || ""}
                                placeholder="000.000.000-00"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#5D4037] mb-2">
                            Telefone / WhatsApp
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="tel"
                                name="phone"
                                defaultValue={profile?.phone || ""}
                                placeholder="(00) 00000-0000"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#5D4037] mb-2">
                        Email (Login)
                    </label>
                    <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado.</p>
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Salvar Alterações
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
