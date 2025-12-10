"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        // Mock Authentication
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (email === "admin@confeitaria.com" && password === "demo123") {
            router.push("/");
        } else {
            setError("Credenciais inválidas. Tente admin@confeitaria.com / demo123");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Graphic/Image Placeholder */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>

            <div className="z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-primary">Confeiteiro</h1>
                    <p className="text-text-secondary">Faça login para gerenciar sua confeitaria</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Bem-vindo de volta</CardTitle>
                        <CardDescription>Insira suas credenciais para continuar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="email"
                                type="email"
                                label="E-mail"
                                placeholder="admin@confeitaria.com"
                                required

                            />
                            <Input
                                name="password"
                                type="password"
                                label="Senha"
                                placeholder="••••••"
                                required
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-error/10 text-error text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <a href="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</a>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
