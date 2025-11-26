# 🚀 Integración del Pipeline CI/CD - Paso a Paso

## ✅ PASO 1: Verificar GitHub CLI (2 minutos)

### 1.1 - Verificar si GitHub CLI está instalado

```powershell
gh --version
```

**¿Qué esperar?**
- ✅ Si ves: `gh version 2.x.x` → **Continúa al paso 1.3**
- ❌ Si ves error → **Continúa al paso 1.2**

### 1.2 - Instalar GitHub CLI (solo si no está instalado)

```powershell
winget install GitHub.cli
```

Espera 1-2 minutos y reinicia PowerShell.

### 1.3 - Autenticarte en GitHub

```powershell
gh auth login
```

**Selecciona estas opciones:**
1. `GitHub.com` (presiona Enter)
2. `HTTPS` (presiona Enter)
3. `Yes` para usar Git credentials (presiona Y)
4. `Login with a web browser` (presiona Enter)
5. **Copia el código** que aparece (ej: `1234-5678`)
6. Presiona Enter para abrir el navegador
7. **Pega el código** en GitHub
8. Click en **"Authorize"**

**Verificar autenticación:**
```powershell
gh auth status
```

✅ Deberías ver: `✓ Logged in to github.com as [tu-usuario]`

---

## ✅ PASO 2: Verificar Usuario IAM en AWS (1 minuto)

✅ **YA TIENES UN USUARIO IAM CREADO:**

```
Usuario AWS: github-ci
Access Key ID: AKIAXMHKFP4XXEPAI2U2 (Active)
ARN: arn:aws:iam::507297234735:user/github-ci
Cuenta AWS: 507297234735
Console: https://507297234735.signin.aws.amazon.com/console
```

### 2.1 - Verificar Permisos del Usuario

1. **Ve a AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Click en** usuario `github-ci`
3. **Tab "Permissions"**: Verifica que tenga `AWSLambda_FullAccess`
4. **Si no tiene los permisos**: Click "Add permissions" → "AWSLambda_FullAccess"

### 2.2 - Obtener Secret Access Key

⚠️ **IMPORTANTE**: Necesitas el **Secret Access Key** del usuario `github-ci`.

**Si YA TIENES el Secret Access Key guardado:**
- ✅ Pasa directamente al **PASO 3**

**Si NO TIENES el Secret Access Key:**

1. **Ve a AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Click en** usuario `github-ci`
3. **Tab** "Security credentials"
4. **En "Access keys"**: Verás `AKIAXMHKFP4XXEPAI2U2 (Active)`
5. **Click** "Create access key" (para generar un nuevo par de keys)
6. **Selecciona**: "Application running outside AWS"
7. **Click** "Next" → "Create access key"
8. **⚠️ COPIA Y GUARDA ESTOS VALORES AHORA:**
   ```
   Access Key ID: AKIAXMHKFP4XXEPAI2U2 (o la nueva que se genere)
   Secret Access Key: ____________________________________
   ```
9. **Guárdalos** en un archivo temporal (los necesitas en el PASO 3)

⚠️ **NOTA**: El Secret Access Key solo se muestra UNA VEZ al crearlo.

---

## ✅ PASO 3: Configurar GitHub Secrets (3 minutos)

### Opción A: Script Automático (RECOMENDADO)

Ejecuta el script desde PowerShell:

```powershell
cd "c:\dev\GPT 21"
.\scripts\setup-github-secrets.ps1
```

El script te pedirá cada secret. **Ingresa los valores cuando te lo pida:**

1. **AWS_ACCESS_KEY_ID**: `AKIAXMHKFP4XXEPAI2U2`
2. **AWS_SECRET_ACCESS_KEY**: Pega el Secret Access Key del usuario `github-ci`
3. **OPENAI_API_KEY**: Ya lo tienes en `server/.env` (empieza con `sk-proj-`)
4. **ALEXA_SKILL_ID**: 
   - Ve a: https://developer.amazon.com/alexa/console/ask
   - Abre tu skill "Calendario Inteligente"
   - Ve a pestaña **"Build"** → **"Endpoint"**
   - Copia el **Skill ID** (empieza con `amzn1.ask.skill.`)
5. **MONGODB_URI**: De tu `server/.env` (empieza con `mongodb://` o `mongodb+srv://`)

### Opción B: Manual en GitHub (alternativa)

Si prefieres configurar manualmente:

1. **Abre tu repositorio en GitHub:**
   ```
   https://github.com/DaveVelazquez/alexa-chatgpt-calendar
   ```

2. **Ve a Settings → Secrets and variables → Actions**

3. **Click "New repository secret"** para cada uno:

   | Nombre | Valor |
   |--------|-------|
   | `AWS_ACCESS_KEY_ID` | `AKIAXMHKFP4XXEPAI2U2` |
   | `AWS_SECRET_ACCESS_KEY` | Tu Secret Access Key del usuario `github-ci` |
   | `OPENAI_API_KEY` | De `server/.env` (sk-proj-...) |
   | `ALEXA_SKILL_ID` | De Alexa Console (amzn1.ask.skill...) |
   | `MONGODB_URI` | De `server/.env` (mongodb://...) |

### Verificar Secrets Configurados

```powershell
gh secret list --repo DaveVelazquez/alexa-chatgpt-calendar
```

✅ Deberías ver los 5 secrets listados.

---

## ✅ PASO 4: Commit y Push del Pipeline (2 minutos)

### 4.1 - Agregar archivos al staging

```powershell
cd "c:\dev\GPT 21"

git add .github/
git add scripts/
git add PIPELINE*.md
git add .gitignore
git add FUNCIONANDO.md
git add server/routes/alexa.js
```

### 4.2 - Verificar qué se va a commitear

```powershell
git status
```

✅ Deberías ver en verde los archivos del pipeline.

### 4.3 - Hacer commit

```powershell
git commit -m "Add CI/CD pipeline for automatic AWS deployment"
```

### 4.4 - Push a GitHub

```powershell
git push origin main
```

⏳ **Espera 10-15 segundos...**

---

## ✅ PASO 5: Monitorear el Deploy (3-5 minutos)

### 5.1 - Ver el Pipeline en Ejecución

**Opción 1 - Desde la terminal:**
```powershell
gh run watch
```

**Opción 2 - Desde el navegador:**
```
https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions
```

### 5.2 - ¿Qué vas a ver?

El workflow ejecutará estos pasos:

```
📥 Checkout code              (~10 segundos)
🔧 Setup Node.js              (~20 segundos)
📦 Install dependencies       (~60 segundos)
🔐 Create .env file           (~5 segundos)
📦 Create deployment package  (~15 segundos)
🔑 Configure AWS credentials  (~5 segundos)
🚀 Deploy to Lambda           (~90 segundos)
⏳ Wait for Lambda ready      (~20 segundos)
🧪 Test Lambda function       (~10 segundos)
📊 Get Lambda info            (~5 segundos)
```

**Tiempo total: ~3-5 minutos**

### 5.3 - ¿Cómo saber si funcionó?

✅ **ÉXITO**: Verás un ✓ verde y el mensaje "Deployment completed successfully"

❌ **ERROR**: Verás una X roja. Lee los logs para ver qué falló:
```powershell
gh run view --log
```

---

## ✅ PASO 6: Verificar en AWS Lambda (1 minuto)

### 6.1 - Ir a AWS Lambda Console

```
https://console.aws.amazon.com/lambda
```

### 6.2 - Abrir tu función

1. Busca: `alexa-chatgpt-calendar`
2. Click en la función
3. Verifica:
   - ✅ **Last modified**: Debería ser hace unos minutos
   - ✅ **Code size**: ~25 MB
   - ✅ **Runtime**: Node.js 18.x

### 6.3 - Probar la función (opcional)

1. Ve a pestaña **"Test"**
2. Click **"Test"** (usa el evento por defecto)
3. ✅ Deberías ver: `"statusCode": 200`

---

## ✅ PASO 7: Probar la Alexa Skill (2 minutos)

### 7.1 - Ir a Alexa Developer Console

```
https://developer.amazon.com/alexa/console/ask
```

### 7.2 - Abrir tu skill y probar

1. Click en **"Calendario Inteligente"**
2. Ve a pestaña **"Test"**
3. Habilita testing: **"Development"**
4. En el input, escribe: `abre calendario inteligente`
5. ✅ Deberías ver la respuesta de bienvenida

---

## 🎉 ¡PIPELINE INTEGRADO CON ÉXITO!

### ¿Qué acabas de lograr?

✅ Pipeline CI/CD configurado  
✅ Deploy automático a AWS Lambda  
✅ Secrets configurados en GitHub  
✅ Alexa Skill actualizada  
✅ Todo funcionando end-to-end  

### Ahora cada vez que hagas cambios:

```powershell
# 1. Edita tu código
code server/routes/alexa.js

# 2. Commit y push
git add .
git commit -m "Update Alexa handler"
git push origin main

# 3. ¡Automáticamente se despliega a AWS! 🚀
# Ve el progreso con:
gh run watch
```

---

## 🆘 TROUBLESHOOTING

### ❌ Error: "gh: command not found"
**Solución**: Instala GitHub CLI:
```powershell
winget install GitHub.cli
```
Reinicia PowerShell y vuelve a intentar.

### ❌ Error: "AWS credentials not found"
**Solución**: Verifica que los secrets estén configurados:
```powershell
gh secret list --repo DaveVelazquez/alexa-chatgpt-calendar
```
Si no aparecen, repite el Paso 3.

### ❌ Error: "Lambda function not found"
**Solución**: Verifica que el nombre en el workflow coincida:
1. Abre `.github/workflows/deploy-to-aws.yml`
2. Verifica que `LAMBDA_FUNCTION_NAME: alexa-chatgpt-calendar`
3. Compara con tu función en AWS Lambda Console

### ❌ Error: "Permission denied"
**Solución**: El usuario IAM necesita más permisos:
1. Ve a AWS IAM Console
2. Usuario `github-actions-deployer`
3. Agrega política: `AWSLambda_FullAccess`

### ❌ Error: "Package too large"
**Solución**: El ZIP es muy grande (límite: 50 MB directo)
1. Verifica tamaño: `Get-Item lambda-apl.zip | Select Length`
2. Si es >50MB, necesitas usar S3 (documentado en PIPELINE-SETUP.md)

### 🔍 Ver logs detallados del error:
```powershell
gh run view --log
```

---

## 📊 RESUMEN DE LO QUE HICISTE

```
1. ✅ Instalaste GitHub CLI
2. ✅ Te autenticaste en GitHub
3. ✅ Creaste usuario IAM en AWS
4. ✅ Obtuviste Access Keys
5. ✅ Configuraste 5 GitHub Secrets
6. ✅ Hiciste commit del pipeline
7. ✅ Hiciste push a GitHub
8. ✅ El pipeline se ejecutó automáticamente
9. ✅ Lambda se actualizó con el código nuevo
10. ✅ Probaste la Alexa Skill
```

## 🎯 PRÓXIMOS PASOS (OPCIONAL)

- 📊 **Monitoreo**: Configura CloudWatch Alarms
- 🔔 **Notificaciones**: Agrega Slack/Discord webhooks
- 🧪 **Tests**: Agrega tests unitarios
- 🌍 **Frontend**: Despliega el frontend a S3
- 🔄 **Staging**: Crea ambiente de pruebas

---

**🎊 ¡Felicitaciones! Tu pipeline CI/CD está funcionando.**  
**Ahora tu código viaja automáticamente de Git a AWS con cada push.** 🚀

