# GitHub Actions Workflows

Este directorio contiene los workflows de CI/CD para el proyecto Alexa ChatGPT Calendar.

## 📁 Workflows Disponibles

### 1. `deploy-to-aws.yml` - Deploy Backend a Lambda
Despliega automáticamente el backend a AWS Lambda cuando hay cambios en `main`.

**Triggers**:
- Push a rama `main`
- Ejecución manual desde GitHub Actions

**Requisitos**:
- Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `OPENAI_API_KEY`, `ALEXA_SKILL_ID`, `MONGODB_URI`

### 2. `deploy-frontend.yml` - Deploy Frontend a S3
Despliega el frontend React a S3 cuando hay cambios en `client/**`.

**Triggers**:
- Push a rama `main` con cambios en carpeta `client/`
- Ejecución manual

**Requisitos**:
- Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BACKEND_API_URL`
- Opcional: `CLOUDFRONT_DISTRIBUTION_ID`

### 3. `test-and-lint.yml` - Tests y Validaciones
Ejecuta tests y validaciones en cada push o pull request.

**Triggers**:
- Push a `main` o `develop`
- Pull requests a `main`

## 🚀 Configuración Rápida

1. Ve a: https://github.com/DaveVelazquez/alexa-chatgpt-calendar/settings/secrets/actions
2. Agrega los secrets necesarios (ver PIPELINE-SETUP.md)
3. Push a `main` y observa el magic happen! ✨

## 📊 Monitorear Workflows

Ver ejecuciones: https://github.com/DaveVelazquez/alexa-chatgpt-calendar/actions

## 📖 Documentación Completa

Lee `PIPELINE-SETUP.md` para instrucciones detalladas.
