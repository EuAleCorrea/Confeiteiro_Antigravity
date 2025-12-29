"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Required for static export
export function generateStaticParams() {
    return [{ instanceName: 'default' }];
}

export default function Page() {
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
