#!/bin/bash

# Script para configurar GitHub Secrets localmente
# Uso: ./setup-github-secrets.sh

echo "🔐 Configuración de GitHub Secrets para CI/CD"
echo "=============================================="
echo ""

REPO="DaveVelazquez/alexa-chatgpt-calendar"

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado"
    echo "Instala desde: https://cli.github.com/"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado en GitHub"
    echo "Ejecuta: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI configurado correctamente"
echo ""

# Función para agregar secret
add_secret() {
    local secret_name=$1
    local secret_description=$2
    
    echo "📝 Configurando: $secret_name"
    echo "   Descripción: $secret_description"
    read -sp "   Valor: " secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo "   ⏭️  Omitido (valor vacío)"
        echo ""
        return
    fi
    
    echo "$secret_value" | gh secret set "$secret_name" --repo "$REPO"
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Secret agregado exitosamente"
    else
        echo "   ❌ Error al agregar secret"
    fi
    echo ""
}

# Secrets requeridos
echo "🔴 SECRETS OBLIGATORIOS:"
echo ""

add_secret "AWS_ACCESS_KEY_ID" "Access Key ID de IAM (ej: AKIA...)"
add_secret "AWS_SECRET_ACCESS_KEY" "Secret Access Key de IAM"
add_secret "OPENAI_API_KEY" "OpenAI API Key (sk-proj-...)"
add_secret "ALEXA_SKILL_ID" "Alexa Skill ID (amzn1.ask.skill...)"
add_secret "MONGODB_URI" "MongoDB Connection String"

echo ""
echo "🟡 SECRETS OPCIONALES (presiona Enter para omitir):"
echo ""

add_secret "BACKEND_API_URL" "URL del API Gateway (para frontend)"
add_secret "CLOUDFRONT_DISTRIBUTION_ID" "CloudFront Distribution ID (si usas CDN)"

echo ""
echo "🎉 Configuración completada!"
echo ""
echo "📊 Verificar secrets configurados:"
echo "   gh secret list --repo $REPO"
echo ""
echo "🚀 Próximo paso:"
echo "   git push origin main"
echo "   # El pipeline se ejecutará automáticamente"
