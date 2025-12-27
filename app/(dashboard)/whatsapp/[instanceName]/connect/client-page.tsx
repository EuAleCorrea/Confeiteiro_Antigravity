"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import evolutionAPI, { WhatsAppQRCode } from "@/lib/evolution-api";

export default function ConnectClientPage({ params }: { params: Promise<{ instanceName: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const instanceName = resolvedParams.instanceName;

    const [qrCode, setQrCode] = useState<WhatsAppQRCode | null>(null);
    const [status, setStatus] = useState<'loading' | 'qr' | 'verifying' | 'connected' | 'error'>('loading');
    const [refreshing, setRefreshing] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch QR Code
    const fetchQRCode = useCallback(async (isRefresh = false) => {
        if (!isRefresh) setStatus('loading');
        else setRefreshing(true);

        setErrorMessage('');

        try {
            const data = await evolutionAPI.connectInstance(instanceName);
            setQrCode(data);
            setStatus('qr');
            setCountdown(30);
        } catch (error: any) {
            console.error('Erro ao buscar QR Code:', error);
            setErrorMessage(error.message || 'Erro ao gerar QR Code');
            setStatus('error');
        } finally {
            setRefreshing(false);
        }
    }, [instanceName]);

    // Check connection status
    const checkStatus = useCallback(async () => {
        if (status === 'connected') return;

        try {
            const data = await evolutionAPI.getConnectionState(instanceName) as any;
            const state = data?.instance?.state || data?.state || data?.status;

            console.log('WhatsApp Connection State:', state);

            // Se detectar qualquer atividade de conexão, parar o countdown e mudar status
            if (['connecting', 'authenticating'].includes(state)) {
                if (status !== 'verifying') setStatus('verifying');
                setCountdown(0); // Para o timer
            }
            else if (['open', 'CONNECTED'].includes(state)) {
                setStatus('connected');
                setTimeout(() => {
                    router.push(`/whatsapp/${instanceName}`);
                }, 500);
            }
            // Se estiver 'close' e nós estavamos 'verifying', talvez tenha falhado
            else if (state === 'close' && status === 'verifying') {
                // Não volta imediatamente para não piscar, deixa o polling tentar de novo 
                // ou o usuário clica em recarregar
            }

        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, [instanceName, router, status]);

    // Initial load
    useEffect(() => {
        fetchQRCode(false);
    }, [fetchQRCode]);

    // Polling for status every 2 seconds
    useEffect(() => {
        // Poll independente do status (exceto se erro ou loading inicial)
        if (status !== 'loading' && status !== 'error' && status !== 'connected') {
            const interval = setInterval(checkStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [status, checkStatus]);

    // Countdown timer for QR refresh
    // Só roda se estiver estritamente em 'qr'
    useEffect(() => {
        if (status === 'qr' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && status === 'qr') {
            fetchQRCode(true);
        }
    }, [countdown, status, fetchQRCode]);

    return (
        <div className="max-w-lg mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/whatsapp">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Conectar WhatsApp</h1>
                    <p className="text-sm text-text-secondary">{instanceName}</p>
                </div>
            </div>

            {/* QR Code Card */}
            <Card className="overflow-hidden">
                <CardContent className="p-8 text-center">
                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="py-12">
                            <Loader2 size={48} className="animate-spin text-primary mx-auto mb-4" />
                            <p className="text-text-secondary">Gerando QR Code...</p>
                        </div>
                    )}

                    {/* QR Code Display */}
                    {(status === 'qr' || status === 'verifying') && qrCode && (
                        <div className="space-y-4">
                            <div className="relative inline-block">
                                {/* QR Code Image */}
                                <div className="bg-white p-4 rounded-xl shadow-inner relative">
                                    <img
                                        src={qrCode.base64}
                                        alt="QR Code WhatsApp"
                                        className={`w-64 h-64 mx-auto transition-opacity duration-300 ${(refreshing || status === 'verifying') ? 'opacity-50' : 'opacity-100'}`}
                                    />
                                    {(refreshing || status === 'verifying') && (
                                        <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 scale-in-center">
                                            <Loader2 size={32} className="animate-spin text-primary" />
                                            {status === 'verifying' && (
                                                <p className="text-[10px] font-bold text-primary bg-white/90 px-2 py-1 rounded-full shadow-sm border border-primary/20">
                                                    VALIDANDO CONEXÃO...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Countdown Badge */}
                                <div className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {countdown}s
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold text-text-primary">Escaneie o QR Code</h3>
                                <ol className="text-sm text-text-secondary text-left max-w-xs mx-auto space-y-2">
                                    <li className="flex gap-2">
                                        <span className="bg-primary/10 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0">1</span>
                                        Abra o WhatsApp no seu telefone
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="bg-primary/10 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0">2</span>
                                        Toque em Menu ou Configurações
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="bg-primary/10 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0">3</span>
                                        Selecione "Aparelhos conectados"
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="bg-primary/10 text-primary w-5 h-5 rounded-full text-xs flex items-center justify-center shrink-0">4</span>
                                        Toque em "Conectar um aparelho"
                                    </li>
                                </ol>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Button variant="ghost" onClick={() => fetchQRCode(true)} size="sm" disabled={refreshing || status === 'verifying'}>
                                    <RefreshCw size={16} className={`mr-2 ${(refreshing || status === 'verifying') ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Atualizando...' : status === 'verifying' ? 'Validando...' : 'Recarregar QR Code'}
                                </Button>

                                <Button variant="outline" onClick={checkStatus} size="sm" className="w-full">
                                    <CheckCircle size={16} className="mr-2" />
                                    Já escaneei o QR Code
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Connected State */}
                    {status === 'connected' && (
                        <div className="py-12 space-y-4">
                            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto scale-in-center">
                                <CheckCircle size={40} className="text-success" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary text-lg">Conectado com sucesso!</h3>
                                <p className="text-sm text-text-secondary">
                                    Redirecionando para o chat...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="py-12 space-y-4">
                            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                                <WifiOff size={40} className="text-error" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary">Erro na conexão</h3>
                                <p className="text-sm text-text-secondary">
                                    {errorMessage}
                                </p>
                            </div>
                            <Button onClick={() => fetchQRCode(false)} size="md">
                                <RefreshCw size={16} className="mr-2" />
                                Tentar Novamente
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Help Text */}
            {(status === 'qr' || status === 'verifying') && (
                <p className="text-center text-xs text-text-secondary">
                    O QR Code é atualizado automaticamente a cada 30 segundos
                </p>
            )}
        </div>
    );
}
