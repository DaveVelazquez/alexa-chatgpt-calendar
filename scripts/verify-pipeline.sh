#!/bin/bash

# Script de verificación rápida del pipeline
# Verifica que todo esté listo para el deploy automático

echo "🔍 Verificación de Pipeline CI/CD"
echo "=================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Función para verificar
check() {
    local name=$1
    local command=$2
    
    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅${NC} $name"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $name"
        ((FAILED++))
        return 1
    fi
}

# Verificaciones
echo "📦 Archivos del Proyecto:"
check "Workflow deploy-to-aws.yml" "test -f .github/workflows/deploy-to-aws.yml"
check "Workflow deploy-frontend.yml" "test -f .github/workflows/deploy-frontend.yml"
check "Workflow test-and-lint.yml" "test -f .github/workflows/test-and-lint.yml"
check "Lambda handler (lambda.js)" "test -f server/lambda.js"
check "Interaction model" "test -f alexa-skill/interaction-model.json"
check "Package.json backend" "test -f server/package.json"
check "Package.json frontend" "test -f client/package.json"

echo ""
echo "🔧 Herramientas:"
check "Git" "command -v git"
check "Node.js" "command -v node"
check "NPM" "command -v npm"
check "GitHub CLI (gh)" "command -v gh"

echo ""
echo "🔐 GitHub Authentication:"
if gh auth status &> /dev/null; then
    echo -e "${GREEN}✅${NC} GitHub CLI autenticado"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} GitHub CLI no autenticado (ejecuta: gh auth login)"
    ((FAILED++))
fi

echo ""
echo "📊 Secrets de GitHub:"
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
    if [ -n "$REPO" ]; then
        SECRETS=$(gh secret list --repo "$REPO" 2>/dev/null | wc -l)
        if [ "$SECRETS" -gt 0 ]; then
            echo -e "${GREEN}✅${NC} $SECRETS secrets configurados"
            gh secret list --repo "$REPO" 2>/dev/null | while read line; do
                echo "   • $line"
            done
            ((PASSED++))
        else
            echo -e "${YELLOW}⚠️${NC} No hay secrets configurados"
            echo "   Ejecuta: ./scripts/setup-github-secrets.sh"
            ((FAILED++))
        fi
    else
        echo -e "${YELLOW}⚠️${NC} No se pudo obtener información del repositorio"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️${NC} GitHub CLI no disponible para verificar secrets"
    ((FAILED++))
fi

echo ""
echo "📝 Validación de Archivos JSON:"
check "interaction-model.json válido" "node -e \"JSON.parse(require('fs').readFileSync('alexa-skill/interaction-model.json'))\""
check "package.json backend válido" "node -e \"JSON.parse(require('fs').readFileSync('server/package.json'))\""
check "package.json frontend válido" "node -e \"JSON.parse(require('fs').readFileSync('client/package.json'))\""

echo ""
echo "🌿 Git Status:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo -e "${GREEN}✅${NC} Rama actual: $BRANCH"
    
    if [ "$BRANCH" = "main" ]; then
        echo -e "${GREEN}✅${NC} En rama main (listo para deploy)"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️${NC} No estás en rama main (el pipeline solo se ejecuta en main)"
        ((FAILED++))
    fi
    
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "${GREEN}✅${NC} No hay cambios sin commit"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️${NC} Hay $UNCOMMITTED archivos sin commit"
        echo "   Ejecuta: git status"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌${NC} No es un repositorio Git"
    ((FAILED++))
fi

echo ""
echo "=================================="
echo -e "Resultado: ${GREEN}$PASSED passed${NC} | ${RED}$FAILED failed${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Todo listo para el deploy automático!${NC}"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Configura secrets si no lo has hecho:"
    echo "      ./scripts/setup-github-secrets.sh"
    echo ""
    echo "   2. Haz commit de los workflows:"
    echo "      git add .github/"
    echo "      git commit -m 'Add CI/CD pipeline'"
    echo ""
    echo "   3. Push a GitHub:"
    echo "      git push origin main"
    echo ""
    echo "   4. Monitorea el deploy:"
    echo "      gh run watch"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️ Hay algunos problemas que resolver${NC}"
    echo ""
    echo "Revisa los ❌ de arriba y corrige antes de deployar"
    exit 1
fi
