# 🚀 AWS Deployment Guide

## Complete Alexa ChatGPT Calendar Skill - Production Ready

Este proyecto está listo para desplegar en AWS usando **AWS SAM (Serverless Application Model)** con toda la infraestructura como código.

## 📋 Arquitectura de Despliegue

```
Internet
    ↓
CloudFront (CDN)
    ↓
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   S3 Bucket     │    │  API Gateway    │    │   OpenAI API    │
│  (React App)    │    │     (REST)      │    │   ChatGPT       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               ↓
                       ┌─────────────────┐
                       │  Lambda Function │
                       │  (Node.js API)  │
                       └─────────────────┘
                               ↓
                       ┌─────────────────┐
                       │   DynamoDB      │
                       │   (Database)    │
                       └─────────────────┘
                               ↑
                       ┌─────────────────┐
                       │  Alexa Skills   │
                       │    Platform     │
                       └─────────────────┘
```

## 🎯 Recursos de AWS Creados

### Compute & API
- **AWS Lambda**: Backend Node.js API
- **API Gateway**: REST API endpoints
- **CloudFront**: CDN para frontend
- **S3**: Hosting estático para React

### Database & Storage
- **DynamoDB**: Base de datos NoSQL (2 tablas)
- **S3**: Almacenamiento de archivos estáticos

### Security & Monitoring
- **IAM Roles**: Permisos mínimos necesarios
- **CloudWatch**: Logs y monitoreo
- **AWS X-Ray**: Trazabilidad (opcional)

## 🛠️ Guía de Despliegue

### Paso 1: Clonar el Repositorio

```powershell
# Clonar desde GitHub
git clone https://github.com/DaveVelazquez/alexa-chatgpt-calendar.git
cd alexa-chatgpt-calendar
```

### Paso 2: Requisitos Previos

#### Windows (PowerShell)
```powershell
# 1. Instalar AWS CLI
# Descarga desde: https://aws.amazon.com/cli/
# O usar Chocolatey:
choco install awscli

# 2. Instalar SAM CLI
pip install aws-sam-cli
# O usar Chocolatey:
choco install aws-sam-cli

# 3. Configurar AWS
aws configure
```

#### Linux/Mac
```bash
# 1. Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awsclip.zip"
unzip awsclip.zip && sudo ./aws/install

# 2. Instalar SAM CLI
pip install aws-sam-cli

# 3. Configurar AWS
aws configure
```

**Datos necesarios para AWS Configure:**
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `us-east-1` (recomendado para Alexa)
- Output format: `json`

### Paso 3: Preparar el Proyecto

#### Windows (Recomendado)
```powershell
# 1. Instalar dependencias
npm run install:all

# 2. Desplegar automáticamente con script PowerShell
.\deploy-aws.ps1 -OpenAIApiKey "sk-tu-api-key-aqui" -Guided
```

#### Manual (Todos los sistemas)
```bash
# 1. Instalar dependencias del servidor
cd server && npm install && cd ..

# 2. Instalar dependencias del cliente
cd client && npm install && cd ..

# 3. Construir el frontend
cd client && npm run build && cd ..

# 4. Continuar con pasos SAM
```

### Paso 4: Opciones de Despliegue

#### Opción A: Script PowerShell Automatizado (Windows - Recomendado)
```powershell
# Despliegue completo automatizado
.\deploy-aws.ps1 -OpenAIApiKey "sk-proj-tu-api-key-completa" -Guided

# O sin modo guiado
.\deploy-aws.ps1 -OpenAIApiKey "sk-proj-tu-api-key-completa"
```

#### Opción B: SAM Manual (Todos los sistemas)
```bash
# 1. Construir aplicación
sam build

# 2. Desplegar con configuración guiada
sam deploy --guided
```

**Responde las preguntas del deploy guiado:**
- **Stack Name**: `alexa-chatgpt-calendar`
- **AWS Region**: `us-east-1`
- **Parameter Environment**: `prod`
- **Parameter OpenAIApiKey**: `sk-proj-tu-api-key-completa`
- **Confirm changes**: `Y`
- **Allow SAM CLI IAM role creation**: `Y`
- **Save parameters to config file**: `Y`

#### Opción C: Script Bash (Linux/Mac)
```bash
# Usar script automatizado
./scripts/deploy-aws.sh --guided
```

### Paso 4: Configurar Variables de Entorno

```bash
# Obtener nombre de la función Lambda
FUNCTION_NAME=$(aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionName`].OutputValue' \
  --output text)

# Actualizar variables de entorno
aws lambda update-function-configuration \
  --function-name $FUNCTION_NAME \
  --environment Variables='{
    "OPENAI_API_KEY":"sk-tu-api-key-aqui",
    "OPENAI_MODEL":"gpt-3.5-turbo",
    "NODE_ENV":"production"
  }'
```

### Paso 5: Subir Frontend a S3

```bash
# Obtener nombre del bucket
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
  --output text)

# Subir archivos del frontend
aws s3 sync client/build/ s3://$BUCKET_NAME/ --delete

# Invalidar caché de CloudFront (opcional)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistribution`].OutputValue' \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

## 🔧 Configuración de Alexa Skill

### 1. Crear Alexa Skill
1. Ve a [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Crea una nueva skill
3. Selecciona "Custom" como modelo
4. Selecciona "Provision your own" como backend

### 2. Configurar Interaction Model
```bash
# Copiar el modelo de interacción
cp alexa-skill/interaction-model.json [tu-skill-json]
```

### 3. Configurar Endpoint
```bash
# Obtener ARN de la función Lambda
LAMBDA_ARN=$(aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`LambdaFunctionArn`].OutputValue' \
  --output text)

echo "Lambda ARN: $LAMBDA_ARN"
```

1. En Alexa Developer Console, ve a "Endpoint"
2. Selecciona "AWS Lambda ARN"
3. Pega el ARN de la función Lambda
4. Save y Build el modelo

## 📊 URLs de Acceso

Después del despliegue exitoso:

```bash
# Obtener URLs principales
aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteUrl`].OutputValue' \
  --output text

aws cloudformation describe-stacks \
  --stack-name alexa-chatgpt-calendar \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text
```

**Resultado esperado:**
- 🌐 **Frontend**: `https://d1234567890.cloudfront.net`
- 🔗 **API**: `https://abcd1234.execute-api.us-east-1.amazonaws.com/prod/`

## 💰 Estimación de Costos (Mensual)

| Servicio | Uso Típico | Costo Estimado |
|----------|------------|----------------|
| Lambda | 1M requests, 512MB | $5-15 |
| API Gateway | 1M requests | $3-10 |
| DynamoDB | 25GB storage, 1M reads/writes | $5-20 |
| S3 | 5GB storage, 10GB transfer | $1-3 |
| CloudFront | 100GB transfer | $5-15 |
| **Total** | **Uso moderado** | **$19-63/mes** |

## 🔍 Monitoreo y Logs

### CloudWatch Logs
```bash
# Ver logs de Lambda
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/alexa-chatgpt

# Ver logs en tiempo real
aws logs tail /aws/lambda/alexa-chatgpt-backend-prod --follow
```

### Métricas Importantes
- **Lambda**: Duration, Error Rate, Throttles
- **API Gateway**: Request Count, Latency, 4XX/5XX errors
- **DynamoDB**: Read/Write Capacity, Throttles

## 🚀 Actualizaciones y CI/CD

### Actualización Manual
```bash
# Actualizar código
git pull origin main
npm run build
sam build
sam deploy
```

### GitHub Actions (Opcional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: sam build
      - run: sam deploy --no-confirm-changeset
```

## 🔒 Seguridad y Mejores Prácticas

### Variables de Entorno Seguras
```bash
# Usar AWS Parameter Store para secretos
aws ssm put-parameter \
  --name "/alexa-calendar/openai-key" \
  --value "sk-tu-api-key" \
  --type "SecureString"
```

### Permisos IAM Mínimos
- Lambda tiene acceso solo a DynamoDB y CloudWatch
- API Gateway con CORS configurado
- S3 bucket con acceso público limitado

## 🆘 Solución de Problemas

### Error: "Repository not found" al clonar
```powershell
# Verificar URL correcta
git clone https://github.com/DaveVelazquez/alexa-chatgpt-calendar.git
```

### Error: AWS CLI no configurado
```powershell
# Configurar credenciales AWS
aws configure
# Verificar configuración
aws sts get-caller-identity
```

### Error: "Internal Server Error" después del deploy
```powershell
# Ver logs de Lambda
aws logs tail /aws/lambda/alexa-chatgpt-calendar-AlexaChatGPTFunction-* --follow

# Verificar variables de entorno
aws lambda get-function-configuration --function-name alexa-chatgpt-calendar-*
```

### Error: "Access Denied" en S3
```powershell
# Verificar que el bucket se creó correctamente
aws s3 ls | findstr alexa-chatgpt

# Subir frontend manualmente si es necesario
aws s3 sync client/build/ s3://tu-bucket-name/ --delete
```

### Alexa Skill No Responde
1. Verificar endpoint en Developer Console con el ARN correcto
2. Comprobar logs de Lambda en CloudWatch
3. Validar interaction model en Alexa Console
4. Verificar que OpenAI API Key está configurada correctamente

## 📞 Soporte

- 📖 [Documentación completa](./README.md)
- 🐛 [Reportar issues](https://github.com/tu-usuario/alexa-chatgpt-calendar/issues)
- 💬 [Discord](https://discord.gg/tu-servidor)

---

✅ **¡Tu Alexa ChatGPT Calendar Skill está listo para producción en AWS!**