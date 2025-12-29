"use client";

import { SessionProvider } from "next-auth/react";
import ChatClientPage from "./client-page";

export default function Page({ params }: { params: Promise<{ instanceName: string }> }) {
    return (
        <SessionProvider>
            <ChatClientPage params={params} />
        </SessionProvider>
    );
}
