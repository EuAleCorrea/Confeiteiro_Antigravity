$content = 'NEXT_PUBLIC_EVOLUTION_API_URL=https://apiwp.automacaototal.com' + [Environment]::NewLine + 
'NEXT_PUBLIC_EVOLUTION_API_KEY=vhuoz6u7ss7g2v8oy6y0ob4vbbibkik' + [Environment]::NewLine + 
'GOOGLE_CLIENT_ID=1075814320776-hco0uegf2lbg4p0ommnq7uog226kvhl3.apps.googleusercontent.com' + [Environment]::NewLine + 
'GOOGLE_CLIENT_SECRET=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' + [Environment]::NewLine + 
'NEXTAUTH_SECRET=confeiteiro_secret_key_2024_super_seguro' + [Environment]::NewLine + 
'NEXTAUTH_URL=http://localhost:3000' + [Environment]::NewLine + 
'NEXT_PUBLIC_SUPABASE_URL=https://hzbstufkhnurrvnslvkc.supabase.co' + [Environment]::NewLine + 
'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6YnN0dWZraG51cnJ2bnNsdmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczODQ4ODEsImV4cCI6MjA4Mjk2MDg4MX0.X4zWjhNZTS_bhYFq58xGbEq1GP-jisn68lhv4P8ZtdQ'

$content | Out-File -FilePath .env.local -Encoding utf8 -Force
