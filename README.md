# Alexa ChatGPT Calendar Skill

Un sistema inteligente de gestión de calendario que integra ChatGPT y funciona como una Skill de Alexa, con una interfaz web completa para la gestión de tareas y un sistema de recompensas.

## 🚀 Características

### API Backend (Node.js + Express)
- ✅ Integración con la API de ChatGPT/OpenAI
- ✅ Compatible con Alexa Skills Kit (ASK)
- ✅ API REST completa para gestión de calendario
- ✅ Base de datos MongoDB para persistencia
- ✅ Sistema de recompensas y gamificación

### Interfaz Web (React)
- ✅ Dashboard interactivo con estadísticas
- ✅ Calendario visual con gestión de tareas
- ✅ Chat integrado con ChatGPT
- ✅ Sistema de logros y puntos
- ✅ Diseño responsive y moderno

### Alexa Skill
- ✅ Comandos de voz para crear y consultar tareas
- ✅ Integración directa con ChatGPT para consultas
- ✅ Respuestas en español
- ✅ Gestión de calendario por voz

## 🛠️ Tecnologías Utilizadas

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Ask SDK (Alexa Skills Kit)
- OpenAI API
- Moment.js para fechas

**Frontend:**
- React 18
- React Router
- CSS-in-JS (styled-jsx)
- Fetch API para comunicación

**Alexa:**
- Ask SDK Express Adapter
- Intent handlers personalizados
- Slots para captura de datos

## 📋 Requisitos Previos

1. **Node.js** (versión 16 o superior)
2. **MongoDB** (local o MongoDB Atlas)
3. **Cuenta OpenAI** con API Key
4. **Cuenta Amazon Developer** (para Alexa Skills)

## 🚀 Instalación y Configuración

### 1. Clonar y configurar el proyecto

```bash
# Instalar dependencias principales
npm run install:all

# O instalar manualmente cada parte
npm install                    # Dependencias principales
cd server && npm install      # Backend
cd ../client && npm install   # Frontend
```

### 2. Configuración del Backend

1. Copiar el archivo de configuración:
```bash
cd server
cp .env.example .env
```

2. Editar `.env` con tus credenciales:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/alexa-calendar

# OpenAI Configuration
OPENAI_API_KEY=tu_openai_api_key_aqui
OPENAI_MODEL=gpt-3.5-turbo

# Alexa Skills Kit Configuration
ALEXA_SKILL_ID=tu_alexa_skill_id_aqui
ALEXA_VERIFY_SIGNATURE=true
```

### 3. Iniciar la aplicación

```bash
# Desarrollo (inicia backend y frontend simultáneamente)
npm run dev

# O iniciar cada servicio por separado
npm run server:dev    # Backend en puerto 3001
npm run client:dev    # Frontend en puerto 3000
```

### 4. Configuración de la Alexa Skill

1. Ve a [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask)
2. Crea una nueva Skill
3. Configura el endpoint HTTPS apuntando a tu servidor: `https://tu-dominio.com/api/alexa`
4. Importa el siguiente modelo de interacción:

```json
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "calendario inteligente",
      "intents": [
        {
          "name": "ChatGPTIntent",
          "slots": [
            {
              "name": "question",
              "type": "AMAZON.SearchQuery"
            }
          ],
          "samples": [
            "pregúntale a ChatGPT {question}",
            "consulta {question}",
            "dime {question}"
          ]
        },
        {
          "name": "AddTaskIntent",
          "slots": [
            {
              "name": "task",
              "type": "AMAZON.SearchQuery"
            },
            {
              "name": "date",
              "type": "AMAZON.DATE"
            }
          ],
          "samples": [
            "agrega la tarea {task} para {date}",
            "crea una tarea {task} el {date}",
            "añade {task} para el {date}"
          ]
        },
        {
          "name": "GetTasksIntent",
          "samples": [
            "cuáles son mis tareas",
            "qué tengo programado",
            "muéstrame mi calendario"
          ]
        }
      ]
    }
  }
}
```

## 📱 Uso de la Aplicación

### Interfaz Web
1. **Dashboard**: Visualiza estadísticas y tareas recientes
2. **Calendario**: Gestiona tareas por fecha con vista mensual
3. **Tareas**: Lista completa con filtros y edición
4. **ChatGPT**: Chat directo para consultas y asistencia
5. **Recompensas**: Sistema de puntos y logros

### Comandos de Alexa
- "Alexa, abre calendario inteligente"
- "Alexa, pregúntale a calendario inteligente sobre productividad"
- "Alexa, dile a calendario inteligente que agregue estudiar para mañana"
- "Alexa, pregúntale a calendario inteligente cuáles son mis tareas"

### API Endpoints

```
GET    /api/calendar/tasks          # Obtener tareas
POST   /api/calendar/tasks          # Crear tarea
PUT    /api/calendar/tasks/:id      # Actualizar tarea
DELETE /api/calendar/tasks/:id      # Eliminar tarea
GET    /api/calendar/calendar       # Vista calendario
GET    /api/calendar/rewards        # Sistema de recompensas

POST   /api/chatgpt/ask            # Consultar ChatGPT
GET    /api/chatgpt/conversations  # Historial (próximamente)

POST   /api/alexa                  # Webhook Alexa Skill
```

## 🏗️ Estructura del Proyecto

```
alexa-chatgpt-calendar-skill/
├── package.json                   # Configuración principal
├── README.md                     # Documentación
├── .github/
│   └── copilot-instructions.md   # Instrucciones de desarrollo
├── server/                       # Backend Node.js
│   ├── package.json
│   ├── index.js                  # Servidor principal
│   ├── .env.example             # Variables de entorno
│   ├── models/                   # Modelos de MongoDB
│   │   ├── Task.js
│   │   └── Reward.js
│   └── routes/                   # Rutas de la API
│       ├── alexa.js             # Webhook Alexa
│       ├── chatgpt.js           # Integración ChatGPT
│       └── calendar.js          # Gestión calendario
└── client/                       # Frontend React
    ├── package.json
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    └── src/
        ├── index.js             # Punto de entrada
        ├── App.js               # Componente principal
        ├── App.css              # Estilos principales
        └── components/          # Componentes React
            ├── Dashboard.js     # Panel principal
            ├── Calendar.js      # Vista calendario
            ├── Tasks.js         # Gestión de tareas
            ├── ChatGPT.js       # Chat integrado
            └── Rewards.js       # Sistema de recompensas
```

## 🎯 Funcionalidades del Sistema de Recompensas

- **Puntos por tarea**: Cada tarea completada otorga puntos configurables
- **Niveles de usuario**: Principiante → Intermedio → Avanzado → Experto → Leyenda
- **Logros especiales**:
  - 🏆 Primera Victoria (primera tarea)
  - 📚 Maestro de Tareas (10 tareas)
  - 📅 Semana Productiva (7 tareas en una semana)
  - 💰 Coleccionista de Puntos (500 puntos)
  - 👑 Rey de la Consistencia (5 días consecutivos)
  - 🌅 Madrugador / 🌙 Búho Nocturno (horarios específicos)
  - 🎨 Variedad de Tareas (múltiples categorías)

## 🔧 Personalización

### Modificar Puntos de Recompensa
Edita los valores por defecto en `server/models/Task.js`:
```javascript
rewardPoints: {
  type: Number,
  default: 10,  // Cambiar valor por defecto
  min: 0
}
```

### Agregar Nuevos Logros
Edita `client/src/components/Rewards.js` en la función `calculateAchievements()`:
```javascript
{
  id: 'nuevo_logro',
  title: '🌟 Nuevo Logro',
  description: 'Descripción del logro',
  condition: () => /* lógica de condición */,
  points: 100,
  icon: '🏅'
}
```

### Personalizar Respuestas de Alexa
Modifica los handlers en `server/routes/alexa.js`:
```javascript
const speakOutput = 'Tu mensaje personalizado aquí';
```

## 📊 Monitoreo y Logs

### Backend
Los logs del servidor incluyen:
- Conexiones a MongoDB
- Requests de API
- Errores de ChatGPT
- Interacciones con Alexa

### Frontend
Utiliza las herramientas de desarrollo del navegador para:
- Network requests
- Console logs
- React Developer Tools

## 🔒 Seguridad

- Variables de entorno para credenciales
- Validación de requests de Alexa
- Sanitización de inputs de usuario
- Rate limiting (recomendado para producción)
- CORS configurado para desarrollo

## 🚀 Despliegue en AWS (Serverless)

### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/DaveVelazquez/alexa-chatgpt-calendar.git
cd alexa-chatgpt-calendar
```

### Paso 2: Configurar AWS CLI
```bash
aws configure
# Introduce: Access Key, Secret Key, Region (us-east-1), Format (json)
```

### Paso 3: Desplegar Automáticamente

#### Windows (PowerShell)
```powershell
.\deploy-aws.ps1 -OpenAIApiKey "sk-proj-tu-api-key-completa" -Guided
```

#### Linux/Mac
```bash
./scripts/deploy-aws.sh --guided
```

#### Manual (Cualquier sistema)
```bash
npm run install:all
sam build
sam deploy --guided
```

### ¿Qué se despliega automáticamente?
- **Lambda Function**: Backend Node.js serverless
- **API Gateway**: Endpoints REST públicos  
- **S3 + CloudFront**: Frontend React con CDN
- **DynamoDB**: Base de datos NoSQL (2 tablas)
- **IAM Roles**: Permisos mínimos necesarios

📚 **Documentación completa**: [DEPLOYMENT.md](DEPLOYMENT.md)

## 🚀 Despliegue Tradicional (Opcional)

### Backend (Heroku/Railway/DigitalOcean)
1. Configurar variables de entorno
2. Configurar MongoDB Atlas
3. Actualizar CORS origins
4. Configurar dominio HTTPS para Alexa

### Frontend (Vercel/Netlify)
1. Build del proyecto: `npm run build`
2. Configurar proxy hacia API backend
3. Actualizar endpoints en producción

### Alexa Skill
1. Actualizar endpoint HTTPS
2. Certificar SSL del dominio
3. Probar en Alexa Simulator
4. Enviar para certificación (opcional)

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

MIT License - ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar la documentación
2. Buscar en Issues existentes
3. Crear nuevo Issue con detalles del problema
4. Incluir logs relevantes y pasos para reproducir

---

**¡Disfruta organizando tu vida con tu asistente inteligente! 🎉**