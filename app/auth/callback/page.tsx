'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const handleCallback = async () => {
            const supabase = createClient()

            // Primeiro, tenta obter a sessão atual (pode já ter sido estabelecida via hash fragment)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession()

            if (session) {
                // Sessão já existe, redireciona para o dashboard
                const next = searchParams.get('next') ?? '/dashboard'
                router.push(next)
                return
            }

            // Se não há sessão, verifica se há um código na URL (fluxo PKCE)
            const code = searchParams.get('code')
            const next = searchParams.get('next') ?? '/dashboard'

            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                if (!error) {
                    router.push(next)
                } else {
                    setError(error.message)
                }
            } else {
                // Verifica se há erro na URL
                const errorDescription = searchParams.get('error_description')
                if (errorDescription) {
                    setError(errorDescription)
                } else {
                    // Se não houver código nem sessão, redireciona para login
                    router.push('/login')
                }
            }
        }

        handleCallback()
    }, [router, searchParams])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na Autenticação</h1>
                <p className="text-gray-700 mb-6">{error}</p>
                <Link href="/login" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700">
                    Voltar para Login
                </Link>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Autenticando...</p>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AuthCallbackContent />
        </Suspense>
    )
}

