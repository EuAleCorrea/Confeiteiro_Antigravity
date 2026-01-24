"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WhatsAppRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/configuracoes?tab=WhatsApp');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <p className="text-text-secondary">Redirecionando...</p>
        </div>
    );
}
