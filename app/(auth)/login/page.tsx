'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock, Loader2, AlertCircle, User, CheckCircle } from 'lucide-react'

// SVGs for Social Providers
const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
        />
    </svg>
)

const FacebookIcon = () => (
    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path
            fillRule="evenodd"
            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
            clipRule="evenodd"
        />
    </svg>
)

const AppleIcon = () => (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10H12zm0 18c-4.418 0-8-3.582-8-8 0-4.418 3.582-8 8-8s8 3.582 8 8c0 4.418-3.582 8-8 8z"
            clipRule="evenodd"
            fillOpacity="0"
        />
        <path d="M15.548 10.3c.103-1.57 1.306-2.64 1.34-2.67-.023-.075-.815-2.783-2.733-2.783-1.157 0-2.028.67-2.66.67-.655 0-1.673-.655-2.75-.655-2.126 0-3.328 1.62-3.328 3.987 0 2.37 1.464 5.925 3.585 5.925 1.036 0 1.94-.97 3.018-.97 1.054 0 1.764.97 2.97.97 2.158 0 3.65-4.8 3.65-4.8s-2.074-1.155-2.095-4.674zM13.23 3.925c.87-1.05 1.46-2.518 1.304-3.925-1.266.052-2.783.84-3.692 1.905-.807.94-1.517 2.45-1.328 3.84 1.41.108 2.846-.77 3.717-1.82z" />
    </svg>
)

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            if (isSignUp) {
                // Validações de cadastro
                if (password !== confirmPassword) {
                    throw new Error('As senhas não coincidem.')
                }
                if (password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres.')
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name,
                        },
                    },
                })

                if (error) throw error

                setSuccess('Conta criada com sucesso! Verifique seu email para confirmar o cadastro.')
                // Limpa os campos
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setName('')
            } else {
                // Login
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) {
                    if (error.message === 'Invalid login credentials') {
                        throw new Error('Email ou senha incorretos.')
                    }
                    throw error
                }

                router.push('/')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao processar sua solicitação.')
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) {
                if (error.message.includes('provider is not enabled')) {
                    throw new Error(`Login com ${provider.charAt(0).toUpperCase() + provider.slice(1)} ainda não está configurado. Use email e senha por enquanto.`)
                }
                throw error
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
        setError(null)
        setSuccess(null)
    }

    return (
        <div className="fixed inset-0 min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-4">
            <div className="w-full max-w-[1100px] min-h-[600px] bg-white rounded-[32px] shadow-2xl flex overflow-hidden">

                {/* Lado Esquerdo - Branding/Imagem */}
                <div className="w-1/2 bg-gradient-to-br from-[#FFD1DC] via-[#FFE4E1] to-[#FFF0F5] hidden lg:flex flex-col items-center justify-center relative overflow-hidden p-12 text-center">
                    {/* Círculos decorativos */}
                    <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#FFB6C1]/20 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-4xl mb-4 transform rotate-[-6deg]">
                            🎂
                        </div>
                        <h1 className="text-4xl font-bold text-[#8B4513] tracking-tight">
                            Confeiteiro
                        </h1>
                        <p className="text-[#A0522D] text-lg font-medium max-w-xs">
                            Gestão completa e inteligente para o seu negócio doce.
                        </p>
                    </div>
                </div>

                {/* Lado Direito - Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12 bg-white relative">
                    <div className="max-w-[400px] w-full mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta!'}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {isSignUp
                                    ? 'Preencha os dados para começar a usar.'
                                    : 'Entre para gerenciar seus pedidos e receitas.'}
                            </p>
                        </div>

                        {!isSignUp && (
                            <>
                                <div className="space-y-4 mb-8">
                                    <Button
                                        variant="outline"
                                        size="md"
                                        className="w-full h-12 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 font-normal text-gray-700"
                                        onClick={() => handleSocialLogin('google')}
                                    >
                                        <GoogleIcon />
                                        Continuar com Google
                                    </Button>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="w-full h-12 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 font-normal text-gray-700"
                                            onClick={() => handleSocialLogin('facebook')}
                                        >
                                            <FacebookIcon />
                                            Facebook
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="md"
                                            className="w-full h-12 flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50 font-normal text-gray-700"
                                            onClick={() => handleSocialLogin('apple')}
                                        >
                                            <AppleIcon />
                                            Apple
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative mb-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-gray-100" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-400">Ou entre com email</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                {isSignUp && (
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            placeholder="Seu nome"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 h-12"
                                            required
                                        />
                                    </div>
                                )}
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="seu@email.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-12"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                    <Input
                                        placeholder="Sua senha"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12"
                                        required
                                    />
                                </div>
                                {isSignUp && (
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            placeholder="Confirme a senha"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-10 h-12"
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                    <p>{success}</p>
                                </div>
                            )}

                            {!isSignUp && (
                                <div className="flex items-center justify-end">
                                    <a href="#" className="text-sm font-medium text-[#FF69B4] hover:text-[#FF1493] transition-colors">
                                        Esqueceu a senha?
                                    </a>
                                </div>
                            )}

                            <Button
                                type="submit"
                                size="md"
                                className="w-full h-12 bg-[#FF69B4] hover:bg-[#FF1493] text-white font-bold text-base shadow-lg shadow-[#FF69B4]/30 transition-all hover:shadow-[#FF1493]/40"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading
                                    ? (isSignUp ? 'Criando conta...' : 'Entrando...')
                                    : (isSignUp ? 'Criar conta' : 'Entrar')}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
                            <button
                                type="button"
                                onClick={toggleMode}
                                className="font-semibold text-[#FF69B4] hover:text-[#FF1493] bg-transparent border-none cursor-pointer"
                            >
                                {isSignUp ? 'Faça login' : 'Crie agora'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
