import PrintOrderClient from "./PrintOrderClient";

export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function PrintOrderPage() {
    return <PrintOrderClient />;
}
