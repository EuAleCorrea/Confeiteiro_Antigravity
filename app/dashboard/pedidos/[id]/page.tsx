import PedidoDetalhesClient from "./PedidoDetalhesClient";

export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function PedidoDetalhesPage() {
    return <PedidoDetalhesClient />;
}
