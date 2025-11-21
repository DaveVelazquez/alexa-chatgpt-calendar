# 🚀 PASOS RÁPIDOS PARA DESPLIEGUE EN AWS

## ✅ Confirmado: Código en GitHub
**Repositorio**: https://github.com/DaveVelazquez/alexa-chatgpt-calendar

---

## 📋 GUÍA DE DESPLIEGUE PASO A PASO

### 🔧 **Requisitos Previos** (Solo la primera vez)

#### 1. Instalar AWS CLI
```powershell
# Opción A: Descarga manual
# Ve a: https://aws.amazon.com/cli/

# Opción B: Con Chocolatey
choco install awscli
```

#### 2. Instalar SAM CLI
```powershell
pip install aws-sam-cli
```

#### 3. Configurar AWS
```powershell
aws configure
```
**Necesitas:**
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Output format: `json`

---

### 🚀 **Despliegue** (Cada vez que quieras actualizar)

#### Paso 1: Clonar proyecto
```powershell
git clone https://github.com/DaveVelazquez/alexa-chatgpt-calendar.git
cd alexa-chatgpt-calendar
```

#### Paso 2: Desplegar automáticamente
```powershell
.\deploy-aws.ps1 -OpenAIApiKey "sk-proj-tu-api-key-completa" -Guided
```

**⚠️ IMPORTANTE**: Usa tu API Key real de OpenAI que empieza con `sk-proj-`

---

### 🎯 **¿Qué se crea automáticamente en AWS?**

| Servicio | Propósito | Costo Aprox/Mes |
|----------|-----------|------------------|
| 🚀 **Lambda** | Backend Node.js API | $5-15 |
| 🌐 **API Gateway** | Endpoints REST | $3-10 |
| 📁 **S3** | Archivos React | $1-3 |
| ⚡ **CloudFront** | CDN mundial | $5-15 |
| 🗄️ **DynamoDB** | Base de datos | $5-20 |
| **TOTAL** | **Uso moderado** | **$19-63** |

---

### 🔗 **URLs que obtienes:**

Después del despliegue exitoso:
- 🌐 **Frontend**: `https://[id].cloudfront.net`
- 🔗 **API**: `https://[id].execute-api.us-east-1.amazonaws.com/prod/`
- 📊 **Logs**: CloudWatch console AWS

---

### 🎙️ **Configurar Alexa Skill**

1. **Ve a**: [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. **Crea nueva skill**: Custom model
3. **Copia el interaction model** desde `alexa-skill/interaction-model.json`
4. **Configura endpoint** con el ARN de Lambda que aparece después del deploy
5. **Prueba** en el simulador

---

### ⚡ **Comandos Rápidos de Solución**

#### Ver logs de errores:
```powershell
aws logs tail /aws/lambda/alexa-chatgpt-calendar-* --follow
```

#### Actualizar solo el código:
```powershell
git pull origin main
sam build
sam deploy
```

#### Borrar todo (si algo sale mal):
```powershell
aws cloudformation delete-stack --stack-name alexa-chatgpt-calendar
```

---

### 📞 **Ayuda**

- 📖 **Documentación completa**: [DEPLOYMENT.md](DEPLOYMENT.md)
- 📋 **Guía del proyecto**: [README.md](README.md)
- 🐛 **Reportar problemas**: GitHub Issues
- 💬 **Código fuente**: https://github.com/DaveVelazquez/alexa-chatgpt-calendar

---

## ✅ **Checklist Final**

- [ ] AWS CLI instalado y configurado
- [ ] SAM CLI instalado
- [ ] OpenAI API Key lista
- [ ] Repositorio clonado
- [ ] Script `deploy-aws.ps1` ejecutado exitosamente
- [ ] URLs de frontend y API funcionando
- [ ] Alexa Skill configurada con Lambda ARN
- [ ] Probado en simulador de Alexa

**🎉 ¡Tu Alexa ChatGPT Calendar Skill está en producción!**