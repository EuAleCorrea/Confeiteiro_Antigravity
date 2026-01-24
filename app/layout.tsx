import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Confeiteiro - Gestão de Confeitaria Artesanal",
    template: "%s | Confeiteiro",
  },
  description: "Sistema de gestão completo para confeitarias artesanais. Controle pedidos, receitas, estoque e finanças em um só lugar. Teste grátis!",
  keywords: ["confeitaria", "gestão de confeitaria", "sistema para confeiteiro", "controle de pedidos", "gestão de doces", "software confeitaria"],
  authors: [{ name: "Automação Total" }],
  creator: "Automação Total",
  publisher: "Automação Total",
  metadataBase: new URL("https://app.automacaototal.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://app.automacaototal.com",
    siteName: "Confeiteiro",
    title: "Confeiteiro - Gestão de Confeitaria Artesanal",
    description: "Sistema de gestão completo para confeitarias artesanais. Controle pedidos, receitas, estoque e finanças.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Confeiteiro - Sistema de Gestão para Confeitarias",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Confeiteiro - Gestão de Confeitaria",
    description: "Sistema completo para gestão de confeitarias artesanais.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

