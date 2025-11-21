const express = require('express');
const { ExpressAdapter } = require('ask-sdk-express-adapter');
const {
  SkillBuilders,
  HandlerInput,
  RequestHandler,
  ErrorHandler
} = require('ask-sdk-core');

const router = express.Router();

// Intent Handlers
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Bienvenido a tu asistente de calendario con ChatGPT. ¿En qué puedo ayudarte hoy?';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const ChatGPTIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ChatGPTIntent';
  },
  async handle(handlerInput) {
    const userQuestion = handlerInput.requestEnvelope.request.intent.slots.question.value;
    
    if (!userQuestion) {
      const speakOutput = 'No escuché tu pregunta. ¿Podrías repetirla?';
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt(speakOutput)
        .getResponse();
    }
    
    try {
      const axios = require('axios');
      const response = await axios.post('http://localhost:3001/api/chatgpt/ask', {
        question: userQuestion,
        context: 'Usuario interactuando por voz con Alexa, respuesta debe ser conversacional'
      }, {
        timeout: 25000 // 25 seconds timeout for Alexa
      });
      
      let speakOutput = response.data.response;
      
      // Clean up response for voice (remove emojis and formatting)
      speakOutput = speakOutput
        .replace(/[📅📋✅❌⏳🎯🏆💡🚀📊⭐🔥💰👑🌅🌙🎨🌈]/g, '') // Remove emojis
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
        .replace(/`(.*?)`/g, '$1') // Remove code formatting
        .trim();
      
      // Limit response length for Alexa (max ~8000 characters)
      if (speakOutput.length > 400) {
        speakOutput = speakOutput.substring(0, 397) + '...';
      }
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .withShouldEndSession(false)
        .getResponse();
        
    } catch (error) {
      console.error('Alexa ChatGPT Error:', error.message);
      
      let speakOutput;
      if (error.code === 'ECONNREFUSED') {
        speakOutput = 'No puedo conectar con el servicio de ChatGPT en este momento.';
      } else if (error.response?.status === 429) {
        speakOutput = 'He alcanzado el límite de consultas. Intenta de nuevo en unos minutos.';
      } else {
        speakOutput = 'Lo siento, hubo un problema al procesar tu consulta. ¿Puedo ayudarte con algo más?';
      }
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .reprompt('¿En qué más puedo ayudarte?')
        .getResponse();
    }
  }
};

const CalendarIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AddTaskIntent' ||
          handlerInput.requestEnvelope.request.intent.name === 'GetTasksIntent');
  },
  async handle(handlerInput) {
    const intentName = handlerInput.requestEnvelope.request.intent.name;
    
    try {
      if (intentName === 'AddTaskIntent') {
        const task = handlerInput.requestEnvelope.request.intent.slots.task.value;
        const date = handlerInput.requestEnvelope.request.intent.slots.date.value;
        
        const axios = require('axios');
        await axios.post('http://localhost:3001/api/calendar/tasks', {
          title: task,
          date: date
        });
        
        const speakOutput = `He agregado la tarea "${task}" para el ${date}.`;
        
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      } else {
        // GetTasksIntent
        const axios = require('axios');
        const response = await axios.get('http://localhost:3001/api/calendar/tasks');
        const tasks = response.data;
        
        let speakOutput = 'Tus próximas tareas son: ';
        tasks.forEach((task, index) => {
          speakOutput += `${index + 1}. ${task.title} para el ${task.date}. `;
        });
        
        return handlerInput.responseBuilder
          .speak(speakOutput)
          .getResponse();
      }
    } catch (error) {
      const speakOutput = 'Hubo un problema con el calendario.';
      
      return handlerInput.responseBuilder
        .speak(speakOutput)
        .getResponse();
    }
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'Puedes preguntarme cualquier cosa, agregar tareas a tu calendario o consultar tus actividades programadas.';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = '¡Hasta luego!';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  }
};

const CustomErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    
    const speakOutput = 'Lo siento, hubo un problema. Por favor intenta de nuevo.';
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
};

// Skill Builder
const skillBuilder = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ChatGPTIntentHandler,
    CalendarIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler
  )
  .addErrorHandlers(CustomErrorHandler);

const adapter = new ExpressAdapter(skillBuilder.create(), false, false);

router.post('/', adapter.getRequestHandlers());

module.exports = router;