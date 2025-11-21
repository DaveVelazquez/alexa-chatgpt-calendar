import React, { useState } from 'react';

const ChatGPT = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '¡Hola! Soy tu asistente de ChatGPT integrado. Puedo ayudarte con preguntas, generar ideas para tareas, sugerir horarios, y mucho más. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [retryTimeout, setRetryTimeout] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Get recent messages for context
      const recentMessages = messages.slice(-4).map(msg => `${msg.type}: ${msg.content}`).join('\n');
      
      const response = await fetch('/api/chatgpt/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: userMessage.content,
          context: recentMessages ? `Conversación reciente:\n${recentMessages}` : undefined
        })
      });

      const data = await response.json();

      // Always create assistant message, even if there's an error
      const assistantMessage = {
        id: Date.now() + 1,
        type: data.configured === false ? 'warning' : 
              (data.error === 'Rate limit exceeded' ? 'rate-limit' : 'assistant'),
        content: data.response,
        timestamp: new Date(),
        usage: data.usage,
        configured: data.configured,
        model: data.model,
        canRetry: data.canRetry,
        waitTime: data.waitTime
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Handle rate limiting with auto-retry
      if (data.error === 'Rate limit exceeded' && data.waitTime) {
        const retryAfter = Math.min(data.waitTime, 300); // Max 5 minutes
        setApiStatus({
          status: 'rate_limited',
          retryAfter: Date.now() + (retryAfter * 1000),
          waitTime: retryAfter
        });
        
        // Set up auto-retry
        if (retryTimeout) clearTimeout(retryTimeout);
        const timeout = setTimeout(() => {
          setApiStatus(null);
          setRetryTimeout(null);
        }, retryAfter * 1000);
        setRetryTimeout(timeout);
      }
      
      // Update error state if needed
      if (data.error && data.configured !== false) {
        console.warn('ChatGPT API Warning:', data.error, data.details);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `❌ Error de conexión: ${error.message}. Verifica que el servidor esté ejecutándose.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: '¡Hola! Soy tu asistente de ChatGPT integrado. Puedo ayudarte con preguntas, generar ideas para tareas, sugerir horarios, y mucho más. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date()
      }
    ]);
    setError(null);
    setApiStatus(null);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
  };

  const checkAPIStatus = async () => {
    try {
      const response = await fetch('/api/chatgpt/status');
      const data = await response.json();
      setApiStatus(data);
      return data;
    } catch (error) {
      console.error('Error checking API status:', error);
      return null;
    }
  };

  const formatWaitTime = (seconds) => {
    if (seconds < 60) return `${seconds} segundos`;
    const minutes = Math.ceil(seconds / 60);
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.ceil(minutes / 60);
    return `${hours} horas`;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickPrompts = [
    '¿Cómo puedo organizar mejor mi calendario diario?',
    'Dame 5 consejos para ser más productivo trabajando desde casa',
    'Crea una rutina matutina efectiva de 30 minutos',
    '¿Cómo puedo mantener el enfoque durante 2 horas seguidas?',
    'Sugiere técnicas para gestionar mejor mi tiempo y prioridades',
    'Ideas para un sistema de recompensas personal'
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt);
  };

  return (
    <div className="chatgpt-container">
      <div className="chat-header">
        <div className="header-info">
          <h1>🤖 ChatGPT Assistant</h1>
          <p>Tu asistente inteligente para productividad y organización</p>
        </div>
        <div className="header-actions">
          <button 
            className="clear-btn"
            onClick={clearChat}
            title="Limpiar conversación"
          >
            🗑️ Limpiar Chat
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✖️</button>
        </div>
      )}

      {apiStatus && apiStatus.status === 'rate_limited' && (
        <div className="rate-limit-banner">
          <div className="rate-limit-content">
            <span>⏰ Límite de API alcanzado</span>
            <div className="rate-limit-info">
              <span>Se restablecerá en: {formatWaitTime(Math.max(0, Math.ceil((apiStatus.retryAfter - Date.now()) / 1000)))}</span>
              <button onClick={checkAPIStatus} className="check-status-btn">
                🔄 Verificar Estado
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quick-prompts">
        <h3>💡 Sugerencias Rápidas:</h3>
        <div className="prompts-grid">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              className="prompt-btn"
              onClick={() => handleQuickPrompt(prompt)}
              disabled={isLoading}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : 
                 message.type === 'error' ? '⚠️' : 
                 message.type === 'warning' ? '💡' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.content}
                </div>
                <div className="message-timestamp">
                  {formatTime(message.timestamp)}
                  {message.usage && message.usage.total_tokens > 0 && (
                    <span className="usage-info">
                      • Tokens: {message.usage.total_tokens}
                    </span>
                  )}
                  {message.model && (
                    <span className="model-info">
                      • {message.model}
                    </span>
                  )}
                  {message.configured === false && (
                    <span className="config-info">
                      • API no configurada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="message-form">
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu pregunta o mensaje..."
              disabled={isLoading}
              className="message-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              className="send-btn"
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </div>
        </form>
      </div>

      <div className="chat-info">
        <div className="info-cards">
          <div className="info-card">
            <h4>🎯 Funcionalidades</h4>
            <ul>
              <li>Respuestas inteligentes a tus preguntas</li>
              <li>Sugerencias para organizar tareas</li>
              <li>Ideas de productividad personalizada</li>
              <li>Consejos de gestión del tiempo</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>💡 Ejemplos de Consultas</h4>
            <ul>
              <li>"¿Cómo puedo mejorar mi rutina matutina?"</li>
              <li>"Crea una lista de tareas para aprender programación"</li>
              <li>"Técnicas para mantener el enfoque trabajando desde casa"</li>
              <li>"Ideas para organizar un horario de ejercicios"</li>
            </ul>
          </div>
          <div className="info-card">
            <h4>⚙️ Configuración y Límites</h4>
            <p>
              Este asistente está conectado directamente con la API de OpenAI.
              Las conversaciones no se guardan permanentemente.
            </p>
            <p>
              <strong>Modelo:</strong> GPT-3.5-turbo<br/>
              <strong>Límite:</strong> ~300 tokens por respuesta<br/>
              <strong>Rate Limits:</strong> Se manejan automáticamente
            </p>
            <div className="status-actions">
              <button onClick={checkAPIStatus} className="status-btn">
                🔍 Verificar Estado API
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .chatgpt-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: calc(100vh - 200px);
        }

        .chat-header {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info h1 {
          margin: 0 0 5px 0;
          color: #333;
        }

        .header-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .clear-btn {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }

        .clear-btn:hover {
          background: #d32f2f;
        }

        .error-banner {
          background: #ffebee;
          color: #c62828;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid #ffcdd2;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #c62828;
          cursor: pointer;
          padding: 2px;
        }

        .rate-limit-banner {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          color: #1565c0;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid #90caf9;
          box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
        }

        .rate-limit-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rate-limit-content > span {
          font-weight: 600;
          font-size: 16px;
        }

        .rate-limit-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .check-status-btn {
          background: #1976d2;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s ease;
        }

        .check-status-btn:hover {
          background: #1565c0;
        }

        .status-actions {
          margin-top: 12px;
        }

        .status-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.2s ease;
        }

        .status-btn:hover {
          background: #5a67d8;
        }

        .quick-prompts {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .quick-prompts h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .prompts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .prompt-btn {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          text-align: left;
          transition: all 0.2s ease;
        }

        .prompt-btn:hover:not(:disabled) {
          background: #e3f2fd;
          border-color: #667eea;
          color: #667eea;
        }

        .prompt-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          height: 500px;
        }

        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message.user .message-content {
          background: #667eea;
          color: white;
          align-self: flex-end;
        }

        .message.assistant .message-content {
          background: #f8f9fa;
          color: #333;
        }

        .message.error .message-content {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ffcdd2;
        }

        .message.warning .message-content {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .message.rate-limit .message-content {
          background: #e3f2fd;
          color: #1565c0;
          border: 1px solid #bbdefb;
        }

        .message-avatar {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f0f0;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .message.user .message-avatar {
          background: #667eea;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          border-bottom-left-radius: 4px;
        }

        .message.user .message-content {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 4px;
        }

        .message-text {
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .message-timestamp {
          font-size: 11px;
          opacity: 0.7;
        }

        .usage-info {
          margin-left: 8px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #666;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .message-form {
          padding: 20px;
          border-top: 1px solid #e9ecef;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .message-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .message-input:focus {
          border-color: #667eea;
        }

        .message-input:disabled {
          background: #f8f9fa;
          opacity: 0.6;
        }

        .send-btn {
          background: #667eea;
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .send-btn:hover:not(:disabled) {
          background: #5a67d8;
          transform: scale(1.05);
        }

        .send-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .chat-info {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .info-card {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .info-card h4 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .info-card ul {
          margin: 0;
          padding-left: 20px;
          color: #666;
        }

        .info-card li {
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .info-card p {
          margin: 0 0 8px 0;
          color: #666;
          line-height: 1.4;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .chatgpt-container {
            height: auto;
          }

          .chat-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .prompts-grid {
            grid-template-columns: 1fr;
          }

          .chat-container {
            height: 400px;
          }

          .message-content {
            max-width: 85%;
          }

          .info-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatGPT;