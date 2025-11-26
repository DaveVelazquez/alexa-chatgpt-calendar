# ⚡ Pipeline CI/CD - Quick Start (5 minutos)

## 🎯 Objetivo
Configurar deploy automático a AWS Lambda en menos de 5 minutos.

## ✅ Pre-requisitos

Verifica que tienes:
- ✓ Cuenta GitHub
- ✓ Cuenta AWS
- ✓ Git instalado
- ✓ Node.js instalado

## 🚀 Pasos Rápidos

### 1. Instalar GitHub CLI (1 min)

**Windows (PowerShell):**
```powershell
winget install GitHub.cli
```

**Mac:**
```bash
brew install gh
```

**Linux:**
```bash
sudo apt install gh
```

### 2. Autenticar GitHub CLI (1 min)

```powershell
gh auth login
# Selecciona: GitHub.com → HTTPS → Yes → Login with browser
```

### 2. Verificar Usuario IAM en AWS (1 min)

✅ **Usuario ya creado**:
```
Usuario: github-ci
Access Key ID: AKIAXMHKFP4XXEPAI2U2
ARN: arn:aws:iam::507297234735:user/github-ci
```

⚠️ **Necesitas el Secret Access Key**:
- Si no lo tienes guardado, créalo nuevo en:
  https://console.aws.amazon.com/iam/
  → Usuario `github-ci` → Security credentials → Create access key

### 4. Configurar Secrets (1 min)

**Opción A - Script Automático (Recomendado):**
```powershell
.\scripts\setup-github-secrets.ps1
```

**Opción B - Manual:**
```powershell
# Copia y pega estos comandos, reemplazando los valores
$REPO = "DaveVelazquez/alexa-chatgpt-calendar"

echo "AKIAXMHKFP4XXEPAI2U2" | gh secret set AWS_ACCESS_KEY_ID --repo $REPO
echo "tu-secret-key-github-ci" | gh secret set AWS_SECRET_ACCESS_KEY --repo $REPO
echo "sk-proj-..." | gh secret set OPENAI_API_KEY --repo $REPO
echo "amzn1.ask.skill..." | gh secret set ALEXA_SKILL_ID --repo $REPO
echo "mongodb://..." | gh secret set MONGODB_URI --repo $REPO
```

### 5. Hacer Push (30 segundos)

```powershell
git add .github/ scripts/ *.md
git commit -m "Add CI/CD pipeline"
git push origin main
```

### 6. Monitorear Deploy (3-5 min)

**Ver en GitHub:**
```
https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions
```

**O desde terminal:**
```powershell
gh run watch
```

## ✅ Verificación Rápida

### ¿Funcionó?

```powershell
# 1. Ver último workflow
gh run list --limit 1

# 2. Ver logs
gh run view --log

# 3. Verificar Lambda actualizado en AWS
# Ve a: https://console.aws.amazon.com/lambda
# Busca: alexa-chatgpt-calendar
# Verifica: LastModified está actualizado
```

## 🎉 ¡Listo!

Tu pipeline está funcionando. Ahora cada `git push` desplegará automáticamente a AWS Lambda.

## 🔄 Uso Diario

### Workflow Normal

```powershell
# 1. Editar código
code server/routes/alexa.js

# 2. Commit y push
git add .
git commit -m "Fix Alexa response"
git push

# 3. Esperar ~3-5 minutos
# El deploy es automático
```

### Ver Estado

```powershell
# Última ejecución
gh run list --limit 1

# Ver en tiempo real
gh run watch

# Ver logs completos
gh run view --log
```

### En Caso de Error

```powershell
# 1. Ver logs del error
gh run view --log

# 2. Corregir el código
code server/routes/alexa.js

# 3. Commit y push (redeploy automático)
git add .
git commit -m "Fix error"
git push
```

## 🛠️ Troubleshooting Rápido

### "Secret not found"
```powershell
# Lista secrets actuales
gh secret list

# Agregar secret faltante
echo "valor" | gh secret set NOMBRE_SECRET
```

### "Lambda not found"
Verifica en `.github/workflows/deploy-to-aws.yml`:
```yaml
env:
  LAMBDA_FUNCTION_NAME: alexa-chatgpt-calendar  # Debe coincidir
```

### "Permission denied"
El usuario IAM necesita estos permisos:
- `lambda:UpdateFunctionCode`
- `lambda:GetFunction`
- `lambda:InvokeFunction`

### Pipeline queda "stuck"
```powershell
# Cancelar ejecución actual
gh run cancel

# Re-ejecutar manualmente
gh workflow run "Deploy to AWS Lambda"
```

## 📚 Más Información

- 📖 **Guía Completa**: [PIPELINE-SETUP.md](PIPELINE-SETUP.md)
- 📊 **Diagrama**: [PIPELINE-DIAGRAM.md](PIPELINE-DIAGRAM.md)
- 🔧 **Scripts**: Carpeta `scripts/`

## 💡 Tips

### Deploy Solo Backend
Si solo modificaste el backend:
```powershell
git add server/
git commit -m "Update backend"
git push
```

### Deploy Solo Frontend
Si solo modificaste el frontend:
```powershell
git add client/
git commit -m "Update UI"
git push
# El workflow deploy-frontend.yml se ejecuta solo si cambió client/
```

### Saltarse el Pipeline
Si necesitas push sin deploy:
```powershell
git commit -m "Docs only [skip ci]"
git push
# [skip ci] en el mensaje evita ejecutar workflows
```

### Deploy Manual
Ejecutar el pipeline sin hacer push:
```powershell
# Desde GitHub UI
# https://github.com/.../actions/workflows/deploy-to-aws.yml
# Click "Run workflow"

# O desde terminal
gh workflow run "Deploy to AWS Lambda"
```

## 🎓 Siguientes Pasos

1. ✅ **Configurar notificaciones** (Slack, Discord, Email)
2. ✅ **Agregar staging environment**
3. ✅ **Configurar rollback automático**
4. ✅ **Agregar monitoreo con CloudWatch**
5. ✅ **Implementar blue-green deployment**

---

**⏱️ Tiempo total de setup: ~5 minutos**  
**🚀 Deploy automático: Cada push a main**  
**📊 Monitoreo: GitHub Actions + AWS Console**

¡Disfruta tu pipeline CI/CD! 🎉
