import PrintBudgetClient from "./PrintBudgetClient";

export async function generateStaticParams() {
    return [{ id: "placeholder" }];
}

export default function PrintPage() {
    return <PrintBudgetClient />;
}
