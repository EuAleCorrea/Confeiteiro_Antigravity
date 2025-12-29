"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatClientPage({ params }: { params: Promise<{ instanceName: string }> }) {
    const router = useRouter();

    useEffect(() => {
        router.replace('/configuracoes?tab=WhatsApp');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-text-secondary">Redirecionando...</p>
        </div>
    );
}
