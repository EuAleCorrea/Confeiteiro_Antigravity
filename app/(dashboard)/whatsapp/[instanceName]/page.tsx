import WhatsAppRedirect from "./WhatsAppRedirect";

// Required for static export
export function generateStaticParams() {
    return [{ instanceName: 'default' }];
}

export default function Page() {
    return <WhatsAppRedirect />;
}
