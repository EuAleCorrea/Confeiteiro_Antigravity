"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
    Mail,
    HardDrive,
    Users,
    Check,
    X,
    Loader2,
    LogOut,
    ExternalLink
} from "lucide-react";

export function GoogleSettings() {
    const { data: session, status } = useSession();
    const [isConnecting, setIsConnecting] = useState(false);

    const isConnected = status === "authenticated" && session?.user;
    const isLoading = status === "loading";

    async function handleConnect() {
        setIsConnecting(true);
        try {
            await signIn("google", { callbackUrl: "/configuracoes?tab=Google" });
        } catch (error) {
            console.error("Erro ao conectar:", error);
        } finally {
            setIsConnecting(false);
        }
    }

    async function handleDisconnect() {
        await signOut({ callbackUrl: "/configuracoes?tab=Google" });
    }

    if (isLoading) {
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
                        Conecte sua conta Google para sincronizar contatos, emails e arquivos.
                    </p>
                </div>
                {isConnected && (
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <Check size={14} />
                            Conectado
                        </span>
                    </div>
                )}
            </div>

            {!isConnected ? (
                /* Not Connected State */
                <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">Conectar com Google</h3>
                        <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
                            Autorize o acesso à sua conta Google para importar contatos,
                            enviar orçamentos por email e fazer backup de arquivos no Drive.
                        </p>
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting}
                            size="lg"
                            className="gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Conectando...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Conectar com Google
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                /* Connected State */
                <>
                    {/* Account Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt="Foto de perfil"
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <span className="text-primary font-bold text-lg">
                                            {session.user?.name?.charAt(0) || "G"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium text-text-primary">
                                        {session.user?.name || "Usuário Google"}
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                        {session.user?.email}
                                    </p>
                                </div>
                                <Button type="button" variant="outline" onClick={handleDisconnect} className="gap-2">
                                    <LogOut size={16} />
                                    Desconectar
                                </Button>
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

                    {/* Quick Actions */}
                    <div>
                        <h3 className="text-sm font-medium text-text-secondary mb-3">Ações Rápidas</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" className="gap-2">
                                <Users size={16} />
                                Importar Contatos
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="gap-2">
                                <HardDrive size={16} />
                                Abrir Drive
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="gap-2">
                                <Mail size={16} />
                                Enviar Email Teste
                            </Button>
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
            )}
        </div>
    );
}
