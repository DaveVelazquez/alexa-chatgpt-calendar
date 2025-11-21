const express = require('express');
const axios = require('axios');
const router = express.Router();

// ChatGPT API integration
router.post('/ask', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Check if OpenAI API key is configured
    const invalidKeys = ['your_openai_api_key_here', 'demo_key_for_testing', '', null, undefined];
    if (!process.env.OPENAI_API_KEY || invalidKeys.includes(process.env.OPENAI_API_KEY)) {
      return res.json({
        response: '⚠️ Para usar ChatGPT, necesitas configurar tu API key de OpenAI en el archivo server/.env.\n\n🔗 Obtén tu API key en: https://platform.openai.com/api-keys\n\n📝 Edita server/.env y reemplaza "demo_key_for_testing" con tu clave real.\n\nMientras tanto, puedo ayudarte con la gestión de tu calendario y tareas. ¿Qué te gustaría hacer?',
        usage: { total_tokens: 0 },
        configured: false
      });
    }

    // Build the system prompt with context
    const systemPrompt = `Eres un asistente inteligente de productividad y calendario. Tu trabajo es:
    - Ayudar con la gestión de tareas y calendario
    - Dar consejos de productividad personalizados
    - Responder preguntas de manera concisa y amigable
    - Sugerir mejoras en la organización del tiempo
    
    ${context ? `Contexto adicional: ${context}` : ''}
    
    Responde siempre en español y mantén las respuestas claras y útiles.`;

    const openaiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const response = openaiResponse.data.choices[0].message.content.trim();
    
    res.json({ 
      response,
      usage: openaiResponse.data.usage,
      configured: true,
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    });

  } catch (error) {
    console.error('Error with ChatGPT API:', error.response?.data || error.message);
    
    // Handle specific OpenAI API errors
    if (error.response?.status === 401) {
      return res.json({
        response: '🔑 Tu API key de OpenAI no es válida. Por favor, verifica tu configuración en server/.env',
        configured: false,
        error: 'Invalid API key'
      });
    }
    
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset-requests'] || error.response.headers['x-ratelimit-reset-tokens'];
      const waitTime = resetTime ? Math.ceil((new Date(resetTime * 1000) - new Date()) / 1000) : 60;
      
      return res.json({
        response: `⏰ Has alcanzado el límite de uso de la API de OpenAI.\n\n🔄 Tu cuota se restablecerá en aproximadamente ${waitTime > 60 ? Math.ceil(waitTime/60) + ' minutos' : waitTime + ' segundos'}.\n\n💡 Mientras tanto, puedes:\n• Gestionar tu calendario y tareas\n• Ver tus recompensas y logros\n• Configurar el sistema\n\n📊 Revisa tu uso en: https://platform.openai.com/usage`,
        configured: true,
        error: 'Rate limit exceeded',
        waitTime: waitTime,
        canRetry: true
      });
    }
    
    if (error.response?.status === 403) {
      return res.json({
        response: '💳 Tu cuenta de OpenAI necesita créditos para usar la API.\n\n🔗 Soluciones:\n• Visita https://platform.openai.com/billing para agregar saldo\n• Revisa tu plan actual en https://platform.openai.com/usage\n• Considera upgrade si necesitas mayor capacidad\n\n📱 Mientras tanto, todas las demás funciones están disponibles.',
        configured: true,
        error: 'Insufficient credits'
      });
    }
    
    // Generic error response
    res.json({ 
      response: '❌ Hubo un problema al conectar con ChatGPT. Mientras tanto, puedo ayudarte con tu calendario y tareas. ¿Qué necesitas?',
      configured: true,
      error: 'Connection error',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Get conversation history (for future implementation)
router.get('/conversations', (req, res) => {
  // TODO: Implement conversation history storage
  res.json({ conversations: [] });
});

// Check API status and limits
router.get('/status', async (req, res) => {
  try {
    const invalidKeys = ['your_openai_api_key_here', 'demo_key_for_testing', '', null, undefined];
    if (!process.env.OPENAI_API_KEY || invalidKeys.includes(process.env.OPENAI_API_KEY)) {
      return res.json({
        configured: false,
        status: 'not_configured',
        message: 'API key no configurada',
        action: 'Configure tu API key en server/.env'
      });
    }

    // Try a simple request to check status
    const testResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    res.json({
      configured: true,
      status: 'available',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      message: 'ChatGPT está disponible',
      usage: testResponse.data.usage
    });

  } catch (error) {
    if (error.response?.status === 429) {
      const resetTime = error.response.headers['x-ratelimit-reset-requests'] || error.response.headers['x-ratelimit-reset-tokens'];
      const waitTime = resetTime ? Math.ceil((new Date(resetTime * 1000) - new Date()) / 1000) : 60;
      
      return res.json({
        configured: true,
        status: 'rate_limited',
        message: 'Límite de uso alcanzado',
        waitTime: waitTime,
        retryAfter: new Date(Date.now() + waitTime * 1000).toISOString()
      });
    }

    res.json({
      configured: true,
      status: 'error',
      message: error.response?.data?.error?.message || 'Error desconocido',
      error: error.response?.status || 'unknown'
    });
  }
});

module.exports = router;