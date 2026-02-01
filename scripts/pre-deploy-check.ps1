# Pre-Deploy Verification Script for EasyPanel/Nixpacks
# Run this BEFORE every deploy: .\scripts\pre-deploy-check.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PRE-DEPLOY VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Check nixpacks.toml exists
Write-Host "[1/6] Checking nixpacks.toml..." -ForegroundColor Yellow
if (Test-Path "nixpacks.toml") {
    $content = Get-Content "nixpacks.toml" -Raw
    if ($content -match "nodejs_22") {
        Write-Host "  OK: nixpacks.toml exists with Node.js 22" -ForegroundColor Green
    } elseif ($content -match "nodejs_20") {
        $warnings += "nixpacks.toml uses nodejs_20 (may be too old for Next.js 16+)"
        Write-Host "  WARN: nodejs_20 detected - consider nodejs_22" -ForegroundColor Yellow
    }
} else {
    $errors += "nixpacks.toml not found!"
    Write-Host "  FAIL: nixpacks.toml not found!" -ForegroundColor Red
}

# 2. Check next.config.ts has standalone output
Write-Host "[2/6] Checking next.config.ts..." -ForegroundColor Yellow
$nextConfig = Get-ChildItem -Filter "next.config.*" | Select-Object -First 1
if ($nextConfig) {
    $content = Get-Content $nextConfig.FullName -Raw
    if ($content -match 'output.*standalone') {
        Write-Host "  OK: output: 'standalone' found" -ForegroundColor Green
    } else {
        $errors += "next.config missing output: 'standalone'"
        Write-Host "  FAIL: output: 'standalone' not found!" -ForegroundColor Red
    }
} else {
    $errors += "next.config.ts/js not found!"
    Write-Host "  FAIL: next.config file not found!" -ForegroundColor Red
}

# 3. Check file encoding (UTF-16 detection)
Write-Host "[3/6] Checking file encoding..." -ForegroundColor Yellow
$utf16Files = @()
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.json -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
        if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            $utf16Files += $_.FullName
        }
    } catch {}
}
if ($utf16Files.Count -eq 0) {
    Write-Host "  OK: All files are UTF-8" -ForegroundColor Green
} else {
    $errors += "Found $($utf16Files.Count) UTF-16LE files"
    Write-Host "  FAIL: Found UTF-16LE files:" -ForegroundColor Red
    $utf16Files | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

# 4. Check npm build works
Write-Host "[4/6] Running npm run build..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Build successful" -ForegroundColor Green
} else {
    $errors += "npm run build failed"
    Write-Host "  FAIL: Build failed! Check errors above." -ForegroundColor Red
}

# 5. Check .next/standalone exists after build
Write-Host "[5/6] Checking standalone build output..." -ForegroundColor Yellow
if (Test-Path ".next/standalone/server.js") {
    Write-Host "  OK: .next/standalone/server.js exists" -ForegroundColor Green
} else {
    $errors += ".next/standalone/server.js not found after build"
    Write-Host "  FAIL: standalone build not generated!" -ForegroundColor Red
}

# 6. Check environment variables template
Write-Host "[6/6] Checking required env vars..." -ForegroundColor Yellow
$requiredEnvs = @("NEXT_PUBLIC_SUPABASE_URL", "NEXTAUTH_SECRET")
$missingEnvs = @()
foreach ($env in $requiredEnvs) {
    if (-not (Get-Content ".env*" -ErrorAction SilentlyContinue | Select-String $env)) {
        $missingEnvs += $env
    }
}
if ($missingEnvs.Count -eq 0) {
    Write-Host "  OK: Required env vars present in .env files" -ForegroundColor Green
} else {
    $warnings += "Some env vars not in local .env (ensure they're in EasyPanel)"
    Write-Host "  WARN: Check these are in EasyPanel: $($missingEnvs -join ', ')" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n[OK] All checks passed! Ready to deploy.`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. git add -A && git commit -m 'message' && git push" -ForegroundColor Gray
    Write-Host "  2. Go to EasyPanel -> Rebuild" -ForegroundColor Gray
    Write-Host "  3. Verify: curl https://your-domain.com`n" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "`n[FAIL] $($errors.Count) error(s) found:`n" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    if ($warnings.Count -gt 0) {
        Write-Host "`nWarnings:" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    }
    Write-Host "`nFix errors before deploying!`n" -ForegroundColor Red
    exit 1
}
