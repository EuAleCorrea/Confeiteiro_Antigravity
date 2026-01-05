# Chaves de Integração - Google OAuth

> ⚠️ **IMPORTANTE**: Este arquivo contém credenciais sensíveis. 
> Nunca compartilhe ou comite no Git.

## Google OAuth (Login com Google)

| Campo | Valor |
|-------|-------|
| **Client ID** | `1075814320776-hco0uegf2lbg4p0ommnq7uog226kvhl3.apps.googleusercontent.com` |
| **Client Secret** | `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` |

### Onde usar:

1. **Supabase Dashboard** → Authentication → Providers → Google
2. **Callback URL**: `https://jtzhuvqkszsveybakbwp.supabase.co/auth/v1/callback`

### Configuração no Google Cloud Console:

- **Projeto**: App Confeiteiro
- **URIs de redirecionamento autorizados**: 
  - `https://jtzhuvqkszsveybakbwp.supabase.co/auth/v1/callback`
- **Origens JavaScript autorizadas**:
  - `http://localhost:3000`
  - (adicionar domínio de produção quando disponível)

---

*Atualizado em: 04/01/2026*
