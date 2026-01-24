import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Confeiteiro - Gestão de Confeitaria Artesanal",
    description: "Sistema de gestão completo para confeitarias artesanais. Controle pedidos, receitas, estoque e finanças em um só lugar. Teste grátis por 14 dias!",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FFFBF7]">
            {children}
        </div>
    );
}

