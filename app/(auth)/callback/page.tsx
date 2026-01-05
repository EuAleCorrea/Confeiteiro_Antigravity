'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Processando autenticação...')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // O Supabase automaticamente processa o hash da URL
                // quando detecta tokens de OAuth
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    throw error
                }

                if (data.session) {
                    setStatus('success')
                    setMessage('Login realizado com sucesso! Redirecionando...')

                    // Aguarda um momento para mostrar a mensagem de sucesso
                    setTimeout(() => {
                        router.push('/')
                        router.refresh()
                    }, 1500)
                } else {
                    // Se não há sessão, pode ser que o hash ainda não foi processado
                    // Tenta detectar o hash da URL
                    const hashParams = new URLSearchParams(window.location.hash.substring(1))
                    const accessToken = hashParams.get('access_token')

                    if (accessToken) {
                        // Força uma verificação da sessão
                        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

                        if (sessionError) throw sessionError

                        if (sessionData.session) {
                            setStatus('success')
                            setMessage('Login realizado com sucesso! Redirecionando...')
                            setTimeout(() => {
                                router.push('/')
                                router.refresh()
                            }, 1500)
                            return
                        }
                    }

                    // Se chegou aqui sem sessão, algo deu errado
                    throw new Error('Não foi possível estabelecer a sessão.')
                }
            } catch (err: any) {
                console.error('Auth callback error:', err)
                setStatus('error')
                setMessage(err.message || 'Erro ao processar autenticação.')

                // Redireciona para login após alguns segundos
                setTimeout(() => {
                    router.push('/login?error=callback-failed')
                }, 3000)
            }
        }

        handleCallback()
    }, [router, supabase.auth])

    return (
        <div className="fixed inset-0 min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    {status === 'loading' && (
                        <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    )}
                </div>

                <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {status === 'loading' && 'Autenticando...'}
                    {status === 'success' && 'Sucesso!'}
                    {status === 'error' && 'Erro na Autenticação'}
                </h1>

                <p className="text-gray-500">
                    {message}
                </p>

                {status === 'error' && (
                    <button
                        onClick={() => router.push('/login')}
                        className="mt-6 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                        Voltar para Login
                    </button>
                )}
            </div>
        </div>
    )
}
