# 🚀 Pipeline CI/CD para Deploy Automático a AWS

## 📋 Descripción General

Este proyecto incluye **3 pipelines de GitHub Actions** para automatizar completamente el deployment:

1. **`deploy-to-aws.yml`** - Deploy del backend (Lambda) ⭐ Principal
2. **`deploy-frontend.yml`** - Deploy del frontend (S3)
3. **`test-and-lint.yml`** - Tests y validaciones

## 🔧 Configuración Inicial (15 minutos)

### Paso 1: Configurar Secrets en GitHub

Ve a tu repositorio: https://github.com/DaveVelazquez/alexa-chatgpt-calendar

1. **Click en** "Settings" (Configuración)
2. **Click en** "Secrets and variables" → "Actions"
3. **Click en** "New repository secret"
4. **Agregar estos secrets** uno por uno:

#### Secrets Requeridos (Obligatorios):

| Secret Name | Valor | Dónde Obtenerlo |
|-------------|-------|-----------------|
| `AWS_ACCESS_KEY_ID` | Tu Access Key ID | AWS IAM Console → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | Tu Secret Access Key | AWS IAM Console (se muestra solo al crear) |
| `OPENAI_API_KEY` | `sk-proj-488c8cE...` | Ya lo tienes en `server/.env` |
| `ALEXA_SKILL_ID` | Tu Skill ID | Alexa Developer Console → Skill → Build → Endpoint |
| `MONGODB_URI` | Connection string | MongoDB Atlas o local |

#### Secrets Opcionales (Para frontend):

| Secret Name | Valor | Descripción |
|-------------|-------|-------------|
| `BACKEND_API_URL` | URL del API Gateway | Para conectar frontend con backend |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de CloudFront | Si usas CloudFront CDN |

### Paso 2: Verificar Usuario IAM en AWS

✅ **Usuario IAM ya creado**:

```
Usuario AWS: github-ci
Access Key ID: AKIAXMHKFP4XXEPAI2U2 (Active)
ARN: arn:aws:iam::507297234735:user/github-ci
Cuenta AWS: 507297234735
Console: https://507297234735.signin.aws.amazon.com/console
```

⚠️ **IMPORTANTE**: Necesitas el **Secret Access Key** correspondiente a esta Access Key.

**Si no tienes el Secret Access Key guardado:**

1. **Ve a AWS IAM Console**: https://console.aws.amazon.com/iam/
2. **Click en** usuario `github-ci`
3. **Tab** "Security credentials"
4. **En "Access keys"**: Verás `AKIAXMHKFP4XXEPAI2U2 (Active)`
5. **Si no tienes el secret**: Click "Create access key"
   - Tipo: "Application running outside AWS"
   - **⚠️ COPIA EL SECRET ACCESS KEY** (solo se muestra una vez)
6. **Guardar** en GitHub Secrets (Paso 1)

**Permisos del usuario `github-ci`**:
- Verifica que tenga `AWSLambda_FullAccess` o permisos equivalentes
- Si necesitas agregar permisos: IAM → Users → github-ci → Add permissions

### Paso 3: Verificar Configuración

Crea este archivo para probar:

```bash
# Verificar que los secrets están configurados
curl -H "Authorization: token TU_GITHUB_TOKEN" \
  https://api.github.com/repos/DaveVelazquez/alexa-chatgpt-calendar/actions/secrets
```

## 🎯 Cómo Usar los Pipelines

### Despliegue Automático (Recomendado)

Cada vez que hagas `git push` a la rama `main`, el pipeline se ejecuta automáticamente:

```powershell
# 1. Hacer cambios en el código
code server/routes/alexa.js

# 2. Commit y push
git add .
git commit -m "Actualizar handlers de Alexa"
git push origin main

# 3. El pipeline se ejecuta automáticamente
# Ve a: https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions
```

### Despliegue Manual

También puedes ejecutar el pipeline manualmente:

1. **Ve a**: https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions
2. **Click en** "Deploy to AWS Lambda"
3. **Click en** "Run workflow" dropdown
4. **Seleccionar** rama `main`
5. **Click en** "Run workflow"

## 📊 Monitorear Despliegues

### Ver Estado del Pipeline

1. **Ve a**: https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions
2. Verás el listado de ejecuciones con estados:
   - ✅ **Success**: Deploy exitoso
   - ❌ **Failure**: Hubo un error
   - 🟡 **In progress**: Ejecutándose
   - ⚪ **Queued**: En cola

### Ver Logs Detallados

1. **Click** en cualquier ejecución del pipeline
2. **Click** en el job "Deploy to AWS Lambda"
3. Verás cada paso con logs detallados:
   - 📥 Checkout code
   - 🔧 Setup Node.js
   - 📦 Install dependencies
   - 🔐 Create .env file
   - 📦 Create deployment package
   - 🔑 Configure AWS credentials
   - 🚀 Deploy to Lambda
   - ⏳ Wait for Lambda to be ready
   - 🧪 Test Lambda function
   - 📊 Get Lambda info

## 🔄 Workflow de Desarrollo Recomendado

### Para Cambios Grandes (Con Testing)

```powershell
# 1. Crear rama de desarrollo
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commit
git add .
git commit -m "Agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# 3. Crear Pull Request en GitHub
# El pipeline test-and-lint.yml se ejecuta automáticamente

# 4. Si los tests pasan, hacer merge a main
# El pipeline deploy-to-aws.yml se ejecuta automáticamente
```

### Para Cambios Pequeños (Deploy Directo)

```powershell
# 1. Hacer cambios
code server/routes/alexa.js

# 2. Commit y push directo a main
git add .
git commit -m "Hotfix: corregir respuesta de Alexa"
git push origin main

# 3. Deploy automático en ~3 minutos
```

## 📦 Lo Que Hace Cada Pipeline

### 1. Deploy to AWS Lambda (`deploy-to-aws.yml`)

**Trigger**: Push a `main` o ejecución manual

**Pasos**:
1. ✅ Checkout del código
2. ✅ Instala Node.js 18
3. ✅ Instala dependencias del server
4. ✅ Crea archivo `.env` con secrets
5. ✅ Crea paquete ZIP optimizado
6. ✅ Configura credenciales AWS
7. ✅ Sube código a Lambda
8. ✅ Espera a que Lambda esté listo
9. ✅ Prueba la función con LaunchRequest
10. ✅ Muestra información del deployment

**Duración**: ~3-5 minutos

### 2. Deploy Frontend (`deploy-frontend.yml`)

**Trigger**: Push a `main` que modifique `client/**`

**Pasos**:
1. ✅ Checkout del código
2. ✅ Instala Node.js 18
3. ✅ Instala dependencias del cliente
4. ✅ Build de React (producción)
5. ✅ Sube archivos a S3
6. ✅ Invalida cache de CloudFront (opcional)

**Duración**: ~4-6 minutos

### 3. Test and Lint (`test-and-lint.yml`)

**Trigger**: Push o Pull Request a `main` o `develop`

**Pasos**:
1. ✅ Tests del backend
2. ✅ Tests del frontend
3. ✅ Valida interaction model de Alexa
4. ✅ Valida archivos JSON
5. ✅ Verifica archivos requeridos

**Duración**: ~2-3 minutos

## 🛠️ Personalización del Pipeline

### Cambiar Región AWS

Edita `.github/workflows/deploy-to-aws.yml`:

```yaml
env:
  AWS_REGION: us-west-2  # Cambiar aquí
```

### Cambiar Nombre de Función Lambda

Edita `.github/workflows/deploy-to-aws.yml`:

```yaml
env:
  LAMBDA_FUNCTION_NAME: mi-skill-alexa  # Cambiar aquí
```

### Agregar Pasos Adicionales

Puedes agregar más steps al pipeline, por ejemplo notificaciones:

```yaml
- name: 📧 Send notification
  if: success()
  run: |
    curl -X POST https://hooks.slack.com/... \
      -d '{"text":"Deploy exitoso!"}'
```

## 🚨 Troubleshooting

### Error: "AWS credentials not found"

**Solución**: Verifica que agregaste `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY` en GitHub Secrets.

### Error: "Lambda function not found"

**Solución**: Asegúrate que el nombre en `LAMBDA_FUNCTION_NAME` coincida con tu función en AWS Lambda.

### Error: "Permission denied"

**Solución**: Verifica que el usuario IAM tenga los permisos necesarios:
- `lambda:UpdateFunctionCode`
- `lambda:GetFunction`
- `lambda:InvokeFunction`

### Pipeline queda "stuck"

**Solución**: 
1. Cancela la ejecución actual
2. Revisa los logs del último paso exitoso
3. Re-ejecuta el workflow manualmente

### Deployment exitoso pero skill no funciona

**Solución**:
1. Verifica los logs de Lambda en AWS CloudWatch
2. Prueba la función directamente desde AWS Console
3. Revisa que las variables de entorno estén correctas

## 📈 Mejoras Futuras

### Agregar Notifications

- Slack notifications
- Email notifications
- Discord webhooks

### Agregar Staging Environment

- Deploy a `staging` antes de `production`
- Tests de integración automáticos
- Rollback automático si fallan tests

### Agregar Monitoring

- CloudWatch alarms
- Performance metrics
- Error tracking con Sentry

### Agregar Database Migrations

- Scripts de migración automáticos
- Backup antes de deploy
- Rollback de base de datos

## 🎉 Ventajas del Pipeline

✅ **Deploy automático** en cada push  
✅ **Testing automático** antes de deploy  
✅ **Rollback fácil** (revertir commit)  
✅ **Historial completo** de deployments  
✅ **Sin intervención manual** necesaria  
✅ **Validación de código** antes de deploy  
✅ **Logs detallados** de cada paso  
✅ **Notificaciones** de éxito/fallo  

## 📚 Recursos Adicionales

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Lambda CI/CD](https://docs.aws.amazon.com/lambda/latest/dg/lambda-cicd.html)
- [Alexa Skills Kit DevOps](https://developer.amazon.com/docs/smapi/ask-cli-intro.html)

---

**¡Tu pipeline está listo!** 🚀 Ahora cada commit a `main` desplegará automáticamente a AWS Lambda.
