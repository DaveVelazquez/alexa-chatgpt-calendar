# Script para configurar GitHub Secrets desde PowerShell
# Uso: .\setup-github-secrets.ps1

Write-Host "🔐 Configuración de GitHub Secrets para CI/CD" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$REPO = "DaveVelazquez/alexa-chatgpt-calendar"

# Verificar si gh CLI está instalado
try {
    $ghVersion = gh --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "✅ GitHub CLI encontrado: $($ghVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala desde: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Verificar autenticación
try {
    gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) { throw }
    Write-Host "✅ Autenticado en GitHub" -ForegroundColor Green
} catch {
    Write-Host "❌ No estás autenticado en GitHub" -ForegroundColor Red
    Write-Host "Ejecuta: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Función para agregar secret
function Add-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$Description
    )
    
    Write-Host "📝 Configurando: $SecretName" -ForegroundColor Yellow
    Write-Host "   Descripción: $Description" -ForegroundColor Gray
    
    $SecretValue = Read-Host "   Valor (Enter para omitir)" -AsSecureString
    
    # Convertir SecureString a texto plano
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecretValue)
    $PlainValue = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    if ([string]::IsNullOrWhiteSpace($PlainValue)) {
        Write-Host "   ⏭️  Omitido (valor vacío)" -ForegroundColor Gray
        Write-Host ""
        return
    }
    
    # Agregar secret usando gh CLI
    $PlainValue | gh secret set $SecretName --repo $REPO 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Secret agregado exitosamente" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Error al agregar secret" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Secrets requeridos
Write-Host "🔴 SECRETS OBLIGATORIOS:" -ForegroundColor Red
Write-Host ""

Add-GitHubSecret "AWS_ACCESS_KEY_ID" "Access Key ID de IAM (ej: AKIA...)"
Add-GitHubSecret "AWS_SECRET_ACCESS_KEY" "Secret Access Key de IAM"
Add-GitHubSecret "OPENAI_API_KEY" "OpenAI API Key (sk-proj-...)"
Add-GitHubSecret "ALEXA_SKILL_ID" "Alexa Skill ID (amzn1.ask.skill...)"
Add-GitHubSecret "MONGODB_URI" "MongoDB Connection String"

Write-Host ""
Write-Host "🟡 SECRETS OPCIONALES (Enter para omitir):" -ForegroundColor Yellow
Write-Host ""

Add-GitHubSecret "BACKEND_API_URL" "URL del API Gateway (para frontend)"
Add-GitHubSecret "CLOUDFRONT_DISTRIBUTION_ID" "CloudFront Distribution ID (si usas CDN)"

Write-Host ""
Write-Host "🎉 Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Verificar secrets configurados:" -ForegroundColor Cyan
Write-Host "   gh secret list --repo $REPO" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Próximo paso:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'Add CI/CD pipeline'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host "   # El pipeline se ejecutará automáticamente" -ForegroundColor Gray
