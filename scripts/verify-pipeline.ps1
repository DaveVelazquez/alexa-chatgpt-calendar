# Script de verificación rápida del pipeline
# Verifica que todo esté listo para el deploy automático

Write-Host "🔍 Verificación de Pipeline CI/CD" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$PASSED = 0
$FAILED = 0

# Función para verificar
function Test-Requirement {
    param(
        [string]$Name,
        [scriptblock]$Test
    )
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host "✅ $Name" -ForegroundColor Green
            $script:PASSED++
            return $true
        }
    } catch {}
    
    Write-Host "❌ $Name" -ForegroundColor Red
    $script:FAILED++
    return $false
}

# Verificaciones
Write-Host "📦 Archivos del Proyecto:" -ForegroundColor Yellow
Test-Requirement "Workflow deploy-to-aws.yml" { Test-Path ".github\workflows\deploy-to-aws.yml" }
Test-Requirement "Workflow deploy-frontend.yml" { Test-Path ".github\workflows\deploy-frontend.yml" }
Test-Requirement "Workflow test-and-lint.yml" { Test-Path ".github\workflows\test-and-lint.yml" }
Test-Requirement "Lambda handler (lambda.js)" { Test-Path "server\lambda.js" }
Test-Requirement "Interaction model" { Test-Path "alexa-skill\interaction-model.json" }
Test-Requirement "Package.json backend" { Test-Path "server\package.json" }
Test-Requirement "Package.json frontend" { Test-Path "client\package.json" }

Write-Host ""
Write-Host "🔧 Herramientas:" -ForegroundColor Yellow
Test-Requirement "Git" { Get-Command git -ErrorAction SilentlyContinue }
Test-Requirement "Node.js" { Get-Command node -ErrorAction SilentlyContinue }
Test-Requirement "NPM" { Get-Command npm -ErrorAction SilentlyContinue }
Test-Requirement "GitHub CLI (gh)" { Get-Command gh -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "🔐 GitHub Authentication:" -ForegroundColor Yellow
try {
    gh auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub CLI autenticado" -ForegroundColor Green
        $PASSED++
    } else {
        throw
    }
} catch {
    Write-Host "⚠️ GitHub CLI no autenticado (ejecuta: gh auth login)" -ForegroundColor Yellow
    $FAILED++
}

Write-Host ""
Write-Host "📊 Secrets de GitHub:" -ForegroundColor Yellow
try {
    $REPO = (gh repo view --json nameWithOwner -q .nameWithOwner 2>$null)
    if ($REPO) {
        $secrets = gh secret list --repo $REPO 2>$null
        if ($secrets) {
            $secretCount = ($secrets | Measure-Object).Count
            Write-Host "✅ $secretCount secrets configurados" -ForegroundColor Green
            $secrets | ForEach-Object {
                Write-Host "   • $_" -ForegroundColor Gray
            }
            $PASSED++
        } else {
            Write-Host "⚠️ No hay secrets configurados" -ForegroundColor Yellow
            Write-Host "   Ejecuta: .\scripts\setup-github-secrets.ps1" -ForegroundColor Gray
            $FAILED++
        }
    } else {
        Write-Host "⚠️ No se pudo obtener información del repositorio" -ForegroundColor Yellow
        $FAILED++
    }
} catch {
    Write-Host "⚠️ GitHub CLI no disponible para verificar secrets" -ForegroundColor Yellow
    $FAILED++
}

Write-Host ""
Write-Host "📝 Validación de Archivos JSON:" -ForegroundColor Yellow
Test-Requirement "interaction-model.json válido" { 
    node -e "JSON.parse(require('fs').readFileSync('alexa-skill/interaction-model.json'))" 2>$null
    $LASTEXITCODE -eq 0
}
Test-Requirement "package.json backend válido" { 
    node -e "JSON.parse(require('fs').readFileSync('server/package.json'))" 2>$null
    $LASTEXITCODE -eq 0
}
Test-Requirement "package.json frontend válido" { 
    node -e "JSON.parse(require('fs').readFileSync('client/package.json'))" 2>$null
    $LASTEXITCODE -eq 0
}

Write-Host ""
Write-Host "🌿 Git Status:" -ForegroundColor Yellow
try {
    git rev-parse --git-dir 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $BRANCH = git branch --show-current
        Write-Host "✅ Rama actual: $BRANCH" -ForegroundColor Green
        
        if ($BRANCH -eq "main") {
            Write-Host "✅ En rama main (listo para deploy)" -ForegroundColor Green
            $PASSED++
        } else {
            Write-Host "⚠️ No estás en rama main (el pipeline solo se ejecuta en main)" -ForegroundColor Yellow
            $FAILED++
        }
        
        $uncommitted = (git status --porcelain | Measure-Object).Count
        if ($uncommitted -eq 0) {
            Write-Host "✅ No hay cambios sin commit" -ForegroundColor Green
            $PASSED++
        } else {
            Write-Host "⚠️ Hay $uncommitted archivos sin commit" -ForegroundColor Yellow
            Write-Host "   Ejecuta: git status" -ForegroundColor Gray
            $FAILED++
        }
    } else {
        throw
    }
} catch {
    Write-Host "❌ No es un repositorio Git" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Resultado: " -NoNewline
Write-Host "$PASSED passed" -ForegroundColor Green -NoNewline
Write-Host " | " -NoNewline
Write-Host "$FAILED failed" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "🎉 Todo listo para el deploy automático!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Configura secrets si no lo has hecho:" -ForegroundColor White
    Write-Host "      .\scripts\setup-github-secrets.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Haz commit de los workflows:" -ForegroundColor White
    Write-Host "      git add .github/" -ForegroundColor Gray
    Write-Host "      git commit -m 'Add CI/CD pipeline'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Push a GitHub:" -ForegroundColor White
    Write-Host "      git push origin main" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   4. Monitorea el deploy:" -ForegroundColor White
    Write-Host "      gh run watch" -ForegroundColor Gray
    Write-Host ""
    exit 0
} else {
    Write-Host "⚠️ Hay algunos problemas que resolver" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Revisa los ❌ de arriba y corrige antes de deployar" -ForegroundColor Gray
    exit 1
}
