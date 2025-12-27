"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, Loader2, CheckCircle, RefreshCw, Wifi, WifiOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import evolutionAPI, { WhatsAppQRCode } from "@/lib/evolution-api";

export default function ConnectInstancePage() {
    const params = useParams();
    const router = useRouter();
    const instanceName = params.instanceName as string;

    const [qrCode, setQrCode] = useState<WhatsAppQRCode | null>(null);
    const [status, setStatus] = useState<'loading' | 'qr' | 'connecting' | 'connected' | 'error'>('loading');
    const [countdown, setCountdown] = useState(30);
    const [errorMessage, setErrorMessage] = useState('');

    // Fetch QR Code
    const fetchQRCode = useCallback(async () => {
        setStatus('loading');
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
        }
    }, [instanceName]);

    // Check connection status
    const checkStatus = useCallback(async () => {
        try {
            const data = await evolutionAPI.getConnectionState(instanceName);
            const state = data.instance.state;

            if (state === 'open') {
                setStatus('connected');
                // Redirect to chat after 2 seconds
                setTimeout(() => {
                    router.push(`/whatsapp/${instanceName}`);
                }, 2000);
            } else if (state === 'connecting') {
                setStatus('connecting');
            }
        } catch (error) {
            console.error('Erro ao verificar status:', error);
        }
    }, [instanceName, router]);

    // Initial load
    useEffect(() => {
        fetchQRCode();
    }, [fetchQRCode]);

    // Polling for status every 2 seconds
    useEffect(() => {
        if (status === 'qr' || status === 'connecting') {
            const interval = setInterval(checkStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [status, checkStatus]);

    // Countdown timer for QR refresh
    useEffect(() => {
        if (status === 'qr' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && status === 'qr') {
            fetchQRCode();
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
                    {status === 'qr' && qrCode && (
                        <div className="space-y-4">
                            <div className="relative inline-block">
                                {/* QR Code Image */}
                                <div className="bg-white p-4 rounded-xl shadow-inner">
                                    <img
                                        src={qrCode.code}
                                        alt="QR Code WhatsApp"
                                        className="w-64 h-64 mx-auto"
                                    />
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

                            <Button variant="ghost" onClick={fetchQRCode} size="sm">
                                <RefreshCw size={16} className="mr-2" />
                                Recarregar QR Code
                            </Button>
                        </div>
                    )}

                    {/* Connecting State */}
                    {status === 'connecting' && (
                        <div className="py-12 space-y-4">
                            <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto">
                                <Smartphone size={40} className="text-warning animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary">Conectando...</h3>
                                <p className="text-sm text-text-secondary">
                                    Aguarde enquanto sincronizamos seu WhatsApp
                                </p>
                            </div>
                            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
                        </div>
                    )}

                    {/* Connected State */}
                    {status === 'connected' && (
                        <div className="py-12 space-y-4">
                            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
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
                            <Button onClick={fetchQRCode}>
                                <RefreshCw size={16} className="mr-2" />
                                Tentar Novamente
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Help Text */}
            {(status === 'qr' || status === 'connecting') && (
                <p className="text-center text-xs text-text-secondary">
                    O QR Code é atualizado automaticamente a cada 30 segundos
                </p>
            )}
        </div>
    );
}
