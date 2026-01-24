import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ['/', '/login', '/auth', '/ajuda', '/contato', '/termos', '/privacidade']

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    let user = null
    try {
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch (error) {
        // Se houver erro de refresh token, ignora e trata como usuário não logado
        // O Supabase irá limpar os cookies automaticamente
        console.warn('Auth error (token may be expired):', error)
    }


    const pathname = request.nextUrl.pathname
    const isPublic = isPublicRoute(pathname)

    // 1. Usuário logado tentando acessar landing page ou login
    // Redireciona para o dashboard
    if (user && (pathname === '/' || pathname.startsWith('/login'))) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // 2. Usuário NÃO logado tentando acessar rotas protegidas
    // Redireciona para login
    if (!user && !isPublic && !pathname.startsWith('/_next') && !pathname.startsWith('/static')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

