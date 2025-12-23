import PedidoEditarClient from "./PedidoEditarClient";

export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function OrderFormPage() {
    return <PedidoEditarClient />;
}
