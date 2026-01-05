"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Mail,
    HardDrive,
    Users,
    Check,
    Loader2,
    LogOut,
    ExternalLink,
    AlertCircle
} from "lucide-react";

export function GoogleSettings() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        }
        getUser();
    }, [supabase.auth]);

    const isConnectedWithGoogle = user?.app_metadata?.provider === 'google';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Integração Google</h2>
                    <p className="text-sm text-text-secondary">
                        Gerencie sua conexão com a conta Google.
                    </p>
                </div>
                {isConnectedWithGoogle && (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <Check size={14} />
                            Conectado via Google
                        </span>
                    </div>
                )}
            </div>

            {isConnectedWithGoogle ? (
                /* Connected State */
                <>
                    {/* Account Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                {user?.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Foto de perfil"
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-primary font-bold text-lg">
                                            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "G"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-text-primary">
                                        {user?.user_metadata?.full_name || "Usuário Google"}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Services / Permissions */}
                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-3">Serviços Disponíveis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="border-green-200 bg-green-50/50">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Users className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Contatos</p>
                                        <p className="text-xs text-text-secondary">Importar e sincronizar</p>
                                    </div>
                                    <Check className="ml-auto text-green-600" size={18} />
                                </CardContent>
                            </Card>

                            <Card className="border-blue-200 bg-blue-50/50">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Mail className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Gmail</p>
                                        <p className="text-xs text-text-secondary">Enviar orçamentos</p>
                                    </div>
                                    <Check className="ml-auto text-blue-600" size={18} />
                                </CardContent>
                            </Card>

                            <Card className="border-yellow-200 bg-yellow-50/50">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <HardDrive className="text-yellow-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Drive</p>
                                        <p className="text-xs text-text-secondary">Backup de arquivos</p>
                                    </div>
                                    <Check className="ml-auto text-yellow-600" size={18} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Help */}
                    <div className="text-xs text-text-secondary pt-4 border-t border-border">
                        <p>
                            Suas credenciais são armazenadas de forma segura. Você pode revogar o acesso
                            a qualquer momento em{" "}
                            <a
                                href="https://myaccount.google.com/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                                Configurações da Conta Google
                                <ExternalLink size={12} />
                            </a>
                        </p>
                    </div>
                </>
            ) : (
                /* Not Connected with Google State */
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="text-amber-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Conta não conectada via Google</h3>
                        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                            Você está logado com email/senha. Para usar as integrações do Google
                            (Contatos, Gmail, Drive), faça login usando sua conta Google.
                        </p>
                        <p className="text-xs text-text-secondary">
                            Para conectar com Google: Saia da conta atual e entre novamente usando
                            o botão "Continuar com Google" na tela de login.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
