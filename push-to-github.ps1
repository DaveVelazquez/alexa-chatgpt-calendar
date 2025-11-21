# Script para subir código a GitHub
# Ejecutar después de crear el repositorio en GitHub

Write-Host "🚀 Subiendo Alexa ChatGPT Calendar Skill a GitHub..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Verificar estado del repositorio
Write-Host "📋 Estado del repositorio local:" -ForegroundColor Cyan
git status
Write-Host ""

# Mostrar commits que se van a subir
Write-Host "📦 Commits a subir:" -ForegroundColor Cyan
git log --oneline
Write-Host ""

# Intentar push
Write-Host "🔄 Subiendo código a GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host ""
    Write-Host "✅ ¡Código subido exitosamente a GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 Tu repositorio está disponible en:" -ForegroundColor Cyan
    Write-Host "   https://github.com/DaveVelazquez/alexa-chatgpt-calendar" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Archivos subidos:" -ForegroundColor Yellow
    git ls-files | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host ""
    Write-Host "🎯 Próximos pasos:" -ForegroundColor Green
    Write-Host "1. Ve a tu repositorio en GitHub" -ForegroundColor White
    Write-Host "2. Verifica que todos los archivos estén presentes" -ForegroundColor White
    Write-Host "3. Lee el README.md para instrucciones completas" -ForegroundColor White
    Write-Host "4. Configura GitHub Pages si deseas hosting gratuito" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "❌ Error al subir código:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Posibles soluciones:" -ForegroundColor Cyan
    Write-Host "1. Verifica que creaste el repositorio en GitHub" -ForegroundColor White
    Write-Host "2. Asegúrate de que el nombre sea exactamente: alexa-chatgpt-calendar" -ForegroundColor White
    Write-Host "3. Verifica tus credenciales de GitHub" -ForegroundColor White
    Write-Host "4. Intenta autenticarte: git config --global credential.helper manager-core" -ForegroundColor White
}