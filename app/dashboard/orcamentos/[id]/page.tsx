import OrcamentoDetalhesClient from "./OrcamentoDetalhesClient";

export async function generateStaticParams() {
    // Since IDs are in localStorage (runtime only), 
    // we provide a placeholder to satisfy the static build.
    return [{ id: "placeholder" }];
}

export default function OrcamentoDetalhesPage() {
    return <OrcamentoDetalhesClient />;
}
