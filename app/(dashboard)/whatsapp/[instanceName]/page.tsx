
import ChatClientPage from "./client-page";

// Required for static export (Cloudflare Pages)
export function generateStaticParams() {
    return [{ instanceName: 'default' }];
}

export default function Page({ params }: { params: Promise<{ instanceName: string }> }) {
    return <ChatClientPage params={params} />;
}
