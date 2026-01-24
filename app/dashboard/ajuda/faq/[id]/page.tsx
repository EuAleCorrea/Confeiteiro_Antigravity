import { faqQuestions } from "@/lib/help-data";
import FAQDetailsClient from "./FAQDetailsClient";

export async function generateStaticParams() {
    return faqQuestions.map((q) => ({
        id: q.id,
    }));
}

export default function FAQDetailsPage() {
    return <FAQDetailsClient />;
}
