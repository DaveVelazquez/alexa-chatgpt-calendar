# 🔄 Pipeline CI/CD - Diagrama de Flujo

## 📊 Arquitectura del Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                         DEVELOPER                                │
│                                                                   │
│  git add .                                                       │
│  git commit -m "Update Alexa handlers"                          │
│  git push origin main                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ PUSH EVENT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GITHUB ACTIONS                              │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WORKFLOW: test-and-lint.yml                             │  │
│  │  ────────────────────────────────                        │  │
│  │  ✓ Validate JSON files                                   │  │
│  │  ✓ Check required files                                  │  │
│  │  ✓ Run tests (if available)                              │  │
│  │  ✓ Build verification                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             │ TESTS PASS                          │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  WORKFLOW: deploy-to-aws.yml                             │  │
│  │  ────────────────────────────                            │  │
│  │  1. 📥 Checkout code from repository                     │  │
│  │  2. 🔧 Setup Node.js 18                                  │  │
│  │  3. 📦 npm ci (install dependencies)                     │  │
│  │  4. 🔐 Create .env from GitHub Secrets                   │  │
│  │  5. 📦 Create deployment ZIP package                     │  │
│  │  6. 🔑 Configure AWS credentials                         │  │
│  │  7. 🚀 aws lambda update-function-code                   │  │
│  │  8. ⏳ Wait for Lambda to be ready                       │  │
│  │  9. 🧪 Test Lambda with LaunchRequest                    │  │
│  │  10. 📊 Get and display Lambda info                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              │ DEPLOY SUCCESS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS LAMBDA                                               │  │
│  │  ──────────                                               │  │
│  │  Function: alexa-chatgpt-calendar                        │  │
│  │  Runtime: Node.js 18.x                                    │  │
│  │  Handler: lambda.handler                                  │  │
│  │  Environment:                                             │  │
│  │    • OPENAI_API_KEY=***                                   │  │
│  │    • MONGODB_URI=***                                      │  │
│  │    • ALEXA_SKILL_ID=***                                   │  │
│  │                                                            │  │
│  │  Trigger: Alexa Skills Kit                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                             │                                     │
│                             │ INVOKES                             │
│                             ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HANDLER EXECUTION                                        │  │
│  │  ──────────────────                                       │  │
│  │  • LaunchRequestHandler                                   │  │
│  │  • ChatGPTIntentHandler                                   │  │
│  │  • AddTaskIntentHandler                                   │  │
│  │  • GetTasksIntentHandler (with APL)                      │  │
│  │  • CompleteTaskIntentHandler                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬─────────────────────────────────┘
                              │
                              │ RESPONSE
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ALEXA DEVICES                                 │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Echo Show  │  │  Echo Dot  │  │ Fire TV    │               │
│  │            │  │            │  │            │               │
│  │  📱 APL    │  │  🔊 Voice  │  │  📺 APL    │               │
│  │  Display   │  │  Only      │  │  Display   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujo Detallado de Deploy

### Fase 1: Preparación (30 segundos)
```
Developer → Git Push → GitHub
   ↓
GitHub detecta cambio en rama 'main'
   ↓
GitHub Actions inicia workflow
   ↓
Checkout código del repositorio
```

### Fase 2: Build (60 segundos)
```
Setup Node.js 18
   ↓
Install production dependencies
   ↓
Create .env file with secrets:
  - OPENAI_API_KEY
  - MONGODB_URI
  - ALEXA_SKILL_ID
   ↓
Create ZIP package (~25 MB)
```

### Fase 3: Deploy (90 segundos)
```
Configure AWS credentials
   ↓
Upload ZIP to Lambda
   ↓
Lambda processes new code
   ↓
Wait for function to be active
   ↓
Test function with sample request
```

### Fase 4: Verification (30 segundos)
```
Invoke Lambda with LaunchRequest
   ↓
Verify response is valid
   ↓
Get function metadata
   ↓
Display deployment summary
   ↓
✅ DEPLOYMENT COMPLETE
```

## 📈 Tiempo Total: ~3-5 minutos

## 🔀 Workflows Paralelos

### Si cambias solo el frontend (client/**):
```
git push
  ↓
deploy-frontend.yml SE EJECUTA
  ↓
Build React app
  ↓
Upload to S3
  ↓
Invalidate CloudFront cache
```

### Si cambias el backend (server/**):
```
git push
  ↓
deploy-to-aws.yml SE EJECUTA
  ↓
Package Lambda code
  ↓
Deploy to AWS Lambda
```

### En cualquier push o PR:
```
git push / Pull Request
  ↓
test-and-lint.yml SE EJECUTA
  ↓
Validate code quality
  ↓
Run tests
  ↓
Check JSON syntax
```

## 🔐 Secrets Flow

```
GitHub Repository Secrets
  │
  ├─ AWS_ACCESS_KEY_ID ────────────┐
  ├─ AWS_SECRET_ACCESS_KEY ────────┤
  ├─ OPENAI_API_KEY ───────────────┤
  ├─ ALEXA_SKILL_ID ───────────────┤
  └─ MONGODB_URI ──────────────────┤
                                    │
                    ┌───────────────▼──────────────┐
                    │  GitHub Actions Runner       │
                    │  Creates .env file:          │
                    │                               │
                    │  PORT=3001                    │
                    │  MONGODB_URI=$SECRET          │
                    │  OPENAI_API_KEY=$SECRET       │
                    │  ALEXA_SKILL_ID=$SECRET       │
                    └───────────────┬──────────────┘
                                    │
                            ┌───────▼───────┐
                            │  ZIP Package  │
                            │  with .env    │
                            └───────┬───────┘
                                    │
                            ┌───────▼───────┐
                            │  AWS Lambda   │
                            │  Environment  │
                            └───────────────┘
```

## 🚦 Deployment States

```
┌─────────────┐
│   QUEUED    │  Esperando recursos disponibles
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ IN PROGRESS │  Ejecutando pasos del workflow
└──────┬──────┘
       │
       ├──────▶ ❌ FAILURE (Rollback automático)
       │
       ▼
┌─────────────┐
│   SUCCESS   │  ✅ Deploy completado
└─────────────┘
       │
       ▼
    Lambda actualizado
       │
       ▼
    Alexa Skill funciona
```

## 🔄 Rollback Process

Si algo sale mal después del deploy:

```
1. Identify the last good commit
   $ git log --oneline

2. Revert to that commit
   $ git revert HEAD
   $ git push origin main

3. Pipeline deploys previous version automatically
   GitHub Actions → AWS Lambda → ✅ Restored

⏱️ Total time: ~3-5 minutes
```

## 📊 Monitoring Dashboard

### GitHub Actions UI
```
https://github.com/[user]/[repo]/actions

Muestra:
  • Estado de cada workflow run
  • Logs detallados de cada step
  • Tiempo de ejecución
  • Historial completo
  • Re-run en caso de fallo
```

### AWS Lambda Console
```
https://console.aws.amazon.com/lambda

Muestra:
  • Última actualización
  • Versión del código
  • Invocaciones
  • Errores
  • CloudWatch Logs
```

### Alexa Developer Console
```
https://developer.amazon.com/alexa/console/ask

Muestra:
  • Endpoint status
  • Test interface
  • Analytics
  • Interaction model
```

## 🎯 Metrics y KPIs

### Pipeline Performance
- ⏱️ **Build Time**: ~60 segundos
- 📦 **Package Size**: ~25 MB
- 🚀 **Deploy Time**: ~90 segundos
- ⏱️ **Total Time**: ~3-5 minutos

### Success Rate
- ✅ **Target**: >95% success rate
- 🔄 **Retries**: Automatic on transient failures
- 📊 **Monitoring**: GitHub Actions dashboard

### Lambda Performance
- 💾 **Memory**: 512 MB (configurable)
- ⏱️ **Timeout**: 30 segundos
- 🔥 **Cold Start**: ~2-3 segundos
- ⚡ **Warm Invocation**: ~100-200 ms

## 🛠️ Troubleshooting Flow

```
Deploy Failed?
  │
  ├─ Check GitHub Actions logs
  │    └─ Identify failed step
  │
  ├─ Common Issues:
  │    │
  │    ├─ AWS Credentials Invalid
  │    │    └─ Fix: Update GitHub Secrets
  │    │
  │    ├─ Lambda Not Found
  │    │    └─ Fix: Check function name in workflow
  │    │
  │    ├─ Permission Denied
  │    │    └─ Fix: Update IAM role permissions
  │    │
  │    └─ Package Too Large
  │         └─ Fix: Optimize dependencies
  │
  └─ Re-run workflow
       └─ GitHub Actions UI → Re-run jobs
```

## 📚 Resources

- 📖 **Setup Guide**: [PIPELINE-SETUP.md](PIPELINE-SETUP.md)
- 🔧 **Scripts**: `scripts/setup-github-secrets.ps1`
- ✅ **Verification**: `scripts/verify-pipeline.ps1`
- 📝 **Workflows**: `.github/workflows/*.yml`

---

**🎉 Tu código viaja automáticamente de Git a AWS con un simple push!**
