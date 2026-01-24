import { mockTickets } from "@/lib/help-data-tickets";
import TicketDetailsClient from "./TicketDetailsClient";

export async function generateStaticParams() {
    return mockTickets.map((t) => ({
        id: t.id,
    }));
}

export default function TicketDetailsPage() {
    return <TicketDetailsClient />;
}
