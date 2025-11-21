import React, { useState, useEffect } from 'react';

const Setup = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [openaiStatus, setOpenaiStatus] = useState('checking');
  const [mongoStatus, setMongoStatus] = useState('checking');
  const [config, setConfig] = useState({
    openaiKey: '',
    mongoUri: 'mongodb://localhost:27017/alexa-calendar'
  });

  useEffect(() => {
    checkBackendStatus();
    checkOpenAIStatus();
    checkMongoStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      setBackendStatus('error');
    }
  };

  const checkOpenAIStatus = async () => {
    try {
      const response = await fetch('/api/chatgpt/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: 'test' })
      });
      
      if (response.status === 401) {
        setOpenaiStatus('needs_key');
      } else if (response.ok) {
        setOpenaiStatus('configured');
      } else {
        setOpenaiStatus('error');
      }
    } catch (error) {
      setOpenaiStatus('error');
    }
  };

  const checkMongoStatus = async () => {
    try {
      const response = await fetch('/api/calendar/tasks');
      if (response.ok) {
        setMongoStatus('connected');
      } else {
        setMongoStatus('needs_setup');
      }
    } catch (error) {
      setMongoStatus('needs_setup');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checking': return '🔄';
      case 'connected': case 'configured': return '✅';
      case 'needs_key': case 'needs_setup': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = (status, service) => {
    switch (status) {
      case 'checking': return 'Verificando...';
      case 'connected': return 'Conectado correctamente';
      case 'configured': return 'Configurado correctamente';
      case 'needs_key': return 'Necesita API Key';
      case 'needs_setup': return 'Necesita configuración';
      case 'error': return 'Error de conexión';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-header">
        <h1>🚀 Configuración Inicial</h1>
        <p>Configura tu Alexa ChatGPT Calendar Skill</p>
      </div>

      <div className="status-checks">
        <h2>📊 Estado de Servicios</h2>
        
        <div className="status-grid">
          <div className="status-card">
            <div className="status-icon">{getStatusIcon(backendStatus)}</div>
            <div className="status-info">
              <h3>Backend API</h3>
              <p>{getStatusText(backendStatus, 'backend')}</p>
              <small>Puerto 3001</small>
            </div>
          </div>

          <div className="status-card">
            <div className="status-icon">{getStatusIcon(openaiStatus)}</div>
            <div className="status-info">
              <h3>OpenAI ChatGPT</h3>
              <p>{getStatusText(openaiStatus, 'openai')}</p>
              <small>API de inteligencia artificial</small>
            </div>
          </div>

          <div className="status-card">
            <div className="status-icon">{getStatusIcon(mongoStatus)}</div>
            <div className="status-info">
              <h3>MongoDB</h3>
              <p>{getStatusText(mongoStatus, 'mongo')}</p>
              <small>Base de datos</small>
            </div>
          </div>
        </div>
      </div>

      <div className="setup-instructions">
        <h2>🔧 Instrucciones de Configuración</h2>

        {openaiStatus === 'needs_key' && (
          <div className="instruction-card">
            <h3>🤖 Configurar OpenAI API</h3>
            <ol>
              <li>Ve a <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
              <li>Crea una nueva API key</li>
              <li>Edita el archivo <code>server/.env</code></li>
              <li>Reemplaza <code>OPENAI_API_KEY=demo_key_for_testing</code> con tu API key</li>
              <li>Reinicia el servidor backend</li>
            </ol>
            <div className="code-example">
              <strong>Ejemplo:</strong>
              <pre>OPENAI_API_KEY=sk-tu-api-key-aqui</pre>
            </div>
          </div>
        )}

        {mongoStatus === 'needs_setup' && (
          <div className="instruction-card">
            <h3>🗃️ Configurar MongoDB</h3>
            
            <div className="mongo-options">
              <div className="option">
                <h4>Opción 1: MongoDB Atlas (Recomendado - Gratis)</h4>
                <ol>
                  <li>Ve a <a href="https://www.mongodb.com/atlas" target="_blank" rel="noopener noreferrer">MongoDB Atlas</a></li>
                  <li>Crea una cuenta gratuita</li>
                  <li>Crea un cluster</li>
                  <li>Obtén el string de conexión</li>
                  <li>Actualiza <code>MONGODB_URI</code> en <code>server/.env</code></li>
                </ol>
                <div className="code-example">
                  <strong>Ejemplo:</strong>
                  <pre>MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/alexa-calendar</pre>
                </div>
              </div>

              <div className="option">
                <h4>Opción 2: MongoDB Local</h4>
                <ol>
                  <li>Descarga <a href="https://www.mongodb.com/try/download/community" target="_blank" rel="noopener noreferrer">MongoDB Community</a></li>
                  <li>Instala con configuración por defecto</li>
                  <li>El archivo <code>.env</code> ya está configurado para MongoDB local</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="instruction-card">
          <h3>🎮 Funcionalidades Disponibles</h3>
          
          <div className="features-grid">
            <div className="feature">
              <h4>Sin configuración adicional:</h4>
              <ul>
                <li>✅ Interfaz web completa</li>
                <li>✅ Navegación entre páginas</li>
                <li>✅ Componentes visuales</li>
              </ul>
            </div>

            <div className="feature">
              <h4>Con MongoDB:</h4>
              <ul>
                <li>✅ Gestión de tareas</li>
                <li>✅ Sistema de calendario</li>
                <li>✅ Sistema de recompensas</li>
                <li>✅ Persistencia de datos</li>
              </ul>
            </div>

            <div className="feature">
              <h4>Con OpenAI API:</h4>
              <ul>
                <li>✅ Chat inteligente</li>
                <li>✅ Comandos de Alexa</li>
                <li>✅ Respuestas personalizadas</li>
                <li>✅ Consejos de productividad</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>🚀 Acciones Rápidas</h3>
          <div className="actions-grid">
            <button onClick={() => window.location.reload()} className="action-btn">
              🔄 Verificar Estado
            </button>
            <button onClick={() => window.location.href = '/'} className="action-btn">
              🏠 Ir a Dashboard
            </button>
            <button onClick={() => window.location.href = '/calendar'} className="action-btn">
              📅 Ver Calendario
            </button>
            <button onClick={() => window.location.href = '/chatgpt'} className="action-btn">
              🤖 Probar ChatGPT
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .setup-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .setup-header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .setup-header p {
          color: #666;
          font-size: 1.2rem;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .status-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-icon {
          font-size: 3rem;
        }

        .status-info h3 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .status-info p {
          margin: 0 0 5px 0;
          color: #666;
        }

        .status-info small {
          color: #999;
          font-size: 0.8rem;
        }

        .instruction-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #667eea;
        }

        .instruction-card h3 {
          margin-top: 0;
          color: #333;
        }

        .instruction-card ol {
          line-height: 1.6;
        }

        .instruction-card a {
          color: #667eea;
          text-decoration: none;
        }

        .instruction-card a:hover {
          text-decoration: underline;
        }

        .code-example {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          border: 1px solid #e9ecef;
        }

        .code-example pre {
          margin: 5px 0 0 0;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #333;
        }

        .mongo-options {
          display: grid;
          gap: 20px;
        }

        .option {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .option h4 {
          margin-top: 0;
          color: #333;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .feature {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .feature h4 {
          margin-top: 0;
          color: #333;
        }

        .feature ul {
          margin-bottom: 0;
          padding-left: 20px;
        }

        .feature li {
          margin-bottom: 5px;
          line-height: 1.4;
        }

        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .action-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .status-grid {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Setup;