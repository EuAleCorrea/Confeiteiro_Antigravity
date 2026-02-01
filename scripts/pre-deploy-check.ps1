# Pre-Deploy Verification Script for EasyPanel/Nixpacks
# Run this BEFORE every deploy: .\scripts\pre-deploy-check.ps1
# Updated: 2026-02-01

param(
    [switch]$SkipRemote,
    [switch]$SkipBuild
)

$VPS_IP = "195.200.4.198"
$VPS_USER = "root"
$CONTAINER_PREFIX = "meu_negocio_confeiteiro"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   PRE-DEPLOY VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# ============================================
# LOCAL CHECKS
# ============================================

Write-Host "--- LOCAL CHECKS ---`n" -ForegroundColor Magenta

# 1. Check nixpacks.toml exists and configuration
Write-Host "[1/8] Checking nixpacks.toml..." -ForegroundColor Yellow
if (Test-Path "nixpacks.toml") {
    $content = Get-Content "nixpacks.toml" -Raw
    
    # Check for provider configuration (CRITICAL: must be array!)
    if ($content -match 'providers\s*=\s*\["node"\]') {
        Write-Host "  OK: providers = ['node'] (force Node.js)" -ForegroundColor Green
    }
    elseif ($content -match '\[providers\]') {
        $errors += "nixpacks.toml: [providers] is WRONG syntax! Use providers = ['node'] (array)"
        Write-Host "  FAIL: [providers] should be providers = ['node'] (array!)" -ForegroundColor Red
    }
    else {
        $errors += "nixpacks.toml missing providers = ['node'] - Nixpacks may detect Deno!"
        Write-Host "  FAIL: Missing providers = ['node']" -ForegroundColor Red
    }
    
    # Check NODE_VERSION
    if ($content -match 'NODE_VERSION\s*=\s*"20"') {
        Write-Host "  OK: NODE_VERSION = '20'" -ForegroundColor Green
    }
    else {
        $warnings += "NODE_VERSION not set to 20"
        Write-Host "  WARN: NODE_VERSION should be set to '20'" -ForegroundColor Yellow
    }
    
    # Check start command
    if ($content -match "node .next/standalone/server.js") {
        Write-Host "  OK: Start command is correct (standalone)" -ForegroundColor Green
    }
    else {
        $errors += "nixpacks.toml missing correct start command"
        Write-Host "  FAIL: Start command should be 'node .next/standalone/server.js'" -ForegroundColor Red
    }
    
    # Check static/public copy commands
    if ($content -match "cp -r .next/static .next/standalone/.next/static") {
        Write-Host "  OK: static folder copy configured" -ForegroundColor Green
    }
    else {
        $errors += "nixpacks.toml missing static folder copy - CSS will not load!"
        Write-Host "  FAIL: Missing 'cp -r .next/static .next/standalone/.next/static'" -ForegroundColor Red
    }
    
    if ($content -match "cp -r public .next/standalone/public") {
        Write-Host "  OK: public folder copy configured" -ForegroundColor Green
    }
    else {
        $warnings += "nixpacks.toml missing public folder copy"
        Write-Host "  WARN: Missing 'cp -r public .next/standalone/public'" -ForegroundColor Yellow
    }
}
else {
    $errors += "nixpacks.toml not found! Nixpacks may detect Deno instead of Node.js"
    Write-Host "  FAIL: nixpacks.toml not found!" -ForegroundColor Red
}

# 2. Check .nixpacksignore excludes Deno folders
Write-Host "[2/8] Checking .nixpacksignore..." -ForegroundColor Yellow
if (Test-Path ".nixpacksignore") {
    $content = Get-Content ".nixpacksignore" -Raw
    if ($content -match "supabase/functions") {
        Write-Host "  OK: supabase/functions excluded" -ForegroundColor Green
    }
    else {
        $warnings += ".nixpacksignore should exclude supabase/functions (Deno code)"
        Write-Host "  WARN: supabase/functions not excluded" -ForegroundColor Yellow
    }
}
else {
    $warnings += ".nixpacksignore not found (recommended to exclude Deno folders)"
    Write-Host "  WARN: .nixpacksignore not found" -ForegroundColor Yellow
}

# 3. Check next.config.ts has standalone output
Write-Host "[3/8] Checking next.config.ts..." -ForegroundColor Yellow
$nextConfig = Get-ChildItem -Filter "next.config.*" | Select-Object -First 1
if ($nextConfig) {
    $content = Get-Content $nextConfig.FullName -Raw
    if ($content -match 'output.*standalone') {
        Write-Host "  OK: output: 'standalone' found" -ForegroundColor Green
    }
    else {
        $errors += "next.config missing output: 'standalone' - REQUIRED for containers"
        Write-Host "  FAIL: output: 'standalone' not found!" -ForegroundColor Red
    }
}
else {
    $errors += "next.config.ts/js not found!"
    Write-Host "  FAIL: next.config file not found!" -ForegroundColor Red
}

# 4. Check package.json has engines field
Write-Host "[4/8] Checking package.json engines..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    if ($pkg.engines -and $pkg.engines.node) {
        Write-Host "  OK: engines.node = $($pkg.engines.node)" -ForegroundColor Green
    }
    else {
        $warnings += "package.json missing engines.node field"
        Write-Host "  WARN: engines.node not specified" -ForegroundColor Yellow
    }
}

# 5. Check file encoding (UTF-16 detection)
Write-Host "[5/8] Checking file encoding (key files)..." -ForegroundColor Yellow
$keyFiles = @("next.config.ts", "package.json", "tsconfig.json", "lib/database.types.ts")
$utf16Files = @()
foreach ($file in $keyFiles) {
    if (Test-Path $file) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($file)
            if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                $utf16Files += $file
            }
        }
        catch {}
    }
}
if ($utf16Files.Count -eq 0) {
    Write-Host "  OK: Key files are UTF-8" -ForegroundColor Green
}
else {
    $errors += "Found UTF-16LE files: $($utf16Files -join ', ')"
    Write-Host "  FAIL: Found UTF-16LE files:" -ForegroundColor Red
    $utf16Files | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

# 6. Check npm build works
if (-not $SkipBuild) {
    Write-Host "[6/8] Running npm run build..." -ForegroundColor Yellow
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK: Build successful" -ForegroundColor Green
    }
    else {
        $errors += "npm run build failed"
        Write-Host "  FAIL: Build failed! Check errors above." -ForegroundColor Red
    }
}
else {
    Write-Host "[6/8] Skipping build (use -SkipBuild:`$false to enable)" -ForegroundColor Gray
}

# 7. Check .next/standalone exists after build
Write-Host "[7/8] Checking standalone build output..." -ForegroundColor Yellow
if (Test-Path ".next/standalone/server.js") {
    Write-Host "  OK: .next/standalone/server.js exists" -ForegroundColor Green
}
else {
    if (-not $SkipBuild) {
        $errors += ".next/standalone/server.js not found after build"
        Write-Host "  FAIL: standalone build not generated!" -ForegroundColor Red
    }
    else {
        $warnings += ".next/standalone not checked (build skipped)"
        Write-Host "  SKIP: Build was skipped, cannot verify standalone" -ForegroundColor Gray
    }
}

# 8. Check Git status and remote
Write-Host "[8/8] Checking Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>&1
if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "  OK: Working directory clean" -ForegroundColor Green
}
else {
    $warnings += "Uncommitted changes detected"
    Write-Host "  WARN: Uncommitted changes" -ForegroundColor Yellow
}

$remotes = git remote -v 2>&1
if ($remotes -match "Confeiteiro") {
    Write-Host "  OK: Remote 'Confeiteiro' found" -ForegroundColor Green
}
else {
    $warnings += "Remote 'Confeiteiro' not found"
    Write-Host "  WARN: Remote 'Confeiteiro' not found" -ForegroundColor Yellow
}

# ============================================
# REMOTE CHECKS (VPS)
# ============================================

if (-not $SkipRemote) {
    Write-Host "`n--- REMOTE CHECKS (VPS) ---`n" -ForegroundColor Magenta
    Write-Host "Connecting to VPS... (will prompt for password)" -ForegroundColor Gray
    
    # Get container name
    Write-Host "[R1] Finding container..." -ForegroundColor Yellow
    $containerList = ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${VPS_USER}@${VPS_IP} "docker ps --format '{{.Names}}' | grep $CONTAINER_PREFIX" 2>&1
    
    if ($containerList -match $CONTAINER_PREFIX) {
        $containerName = ($containerList | Select-Object -First 1).Trim()
        Write-Host "  OK: Container found: $containerName" -ForegroundColor Green
        
        # Check if .next/standalone exists in container
        Write-Host "[R2] Checking .next/standalone in container..." -ForegroundColor Yellow
        $standaloneCheck = ssh ${VPS_USER}@${VPS_IP} "docker exec $containerName ls -la /app/.next/standalone/server.js 2>&1" 2>&1
        if ($standaloneCheck -match "server.js") {
            Write-Host "  OK: .next/standalone/server.js exists in container" -ForegroundColor Green
        }
        else {
            $errors += "Container missing .next/standalone - build not running correctly!"
            Write-Host "  FAIL: .next/standalone NOT FOUND in container!" -ForegroundColor Red
        }
        
        # Check if static folder exists in standalone
        Write-Host "[R3] Checking static folder in standalone..." -ForegroundColor Yellow
        $staticCheck = ssh ${VPS_USER}@${VPS_IP} "docker exec $containerName ls /app/.next/standalone/.next/static 2>&1" 2>&1
        if ($staticCheck -match "chunks") {
            Write-Host "  OK: static folder copied to standalone" -ForegroundColor Green
        }
        else {
            $errors += "Container missing .next/standalone/.next/static - CSS will not load!"
            Write-Host "  FAIL: static folder NOT in standalone - CSS broken!" -ForegroundColor Red
        }
        
        # Check container response
        Write-Host "[R4] Testing app response..." -ForegroundColor Yellow
        $curlResult = ssh ${VPS_USER}@${VPS_IP} "docker exec $containerName curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/ 2>&1" 2>&1
        if ($curlResult -match "200") {
            Write-Host "  OK: App returning HTTP 200" -ForegroundColor Green
        }
        else {
            $warnings += "App response code: $curlResult"
            Write-Host "  WARN: App returning HTTP $curlResult" -ForegroundColor Yellow
        }
        
        # Check build date
        Write-Host "[R5] Checking container age..." -ForegroundColor Yellow
        $containerCreated = ssh ${VPS_USER}@${VPS_IP} "docker inspect --format='{{.Created}}' $containerName 2>&1" 2>&1
        Write-Host "  INFO: Container created: $containerCreated" -ForegroundColor Cyan
        
    }
    else {
        $warnings += "Container not found on VPS"
        Write-Host "  WARN: Container not running on VPS" -ForegroundColor Yellow
    }
}
else {
    Write-Host "`n--- REMOTE CHECKS SKIPPED ---" -ForegroundColor Gray
    Write-Host "Use without -SkipRemote to check VPS container" -ForegroundColor Gray
}

# ============================================
# EASYPANEL REMINDERS
# ============================================

Write-Host "`n--- EASYPANEL CONFIGURATION REMINDERS ---" -ForegroundColor Magenta
Write-Host "Verify these settings in EasyPanel:" -ForegroundColor White
Write-Host "  [Domain] Protocolo Destino: HTTP (not HTTPS!)" -ForegroundColor Yellow
Write-Host "  [Domain] Porta: 8000" -ForegroundColor Yellow
Write-Host "  [Env] NIXPACKS_PROVIDERS=node" -ForegroundColor Yellow
Write-Host "  [Env] NODE_ENV=production" -ForegroundColor Yellow

# ============================================
# SUMMARY
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n[OK] All checks passed! Ready to deploy.`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "  1. git add -A && git commit -m 'message'" -ForegroundColor Gray
    Write-Host "  2. git push Confeiteiro feature/supabase-migration" -ForegroundColor Gray
    Write-Host "  3. Go to EasyPanel -> Rebuild" -ForegroundColor Gray
    Write-Host "  4. Wait for build to complete" -ForegroundColor Gray
    Write-Host "  5. Verify: https://confeiteiro.sinapseai.com`n" -ForegroundColor Gray
    exit 0
}
else {
    Write-Host "`n[FAIL] $($errors.Count) error(s) found:`n" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    if ($warnings.Count -gt 0) {
        Write-Host "`nWarnings:" -ForegroundColor Yellow
        $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    }
    Write-Host "`nFix errors before deploying!`n" -ForegroundColor Red
    exit 1
}
