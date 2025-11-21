# Alexa ChatGPT Calendar Skill - Copilot Instructions

## Project Overview
This is a complete Node.js + React application that integrates ChatGPT with Alexa Skills Kit and provides a web-based calendar management system with gamification features.

### Architecture
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React 18 with custom CSS-in-JS
- **Alexa Integration**: Ask SDK with Express Adapter
- **AI Integration**: OpenAI ChatGPT API
- **Database**: MongoDB with Mongoose ODM

### Key Features
1. **Calendar Management**: Full CRUD operations for tasks with categories, priorities, and rewards
2. **ChatGPT Integration**: Direct API integration for intelligent responses
3. **Alexa Skills**: Voice commands for task management and ChatGPT queries
4. **Gamification**: Points system, achievements, and user levels
5. **Responsive UI**: Modern React interface with mobile support

## Development Guidelines

### Code Style
- Use ES6+ modern JavaScript syntax
- Implement error handling with try/catch blocks
- Follow RESTful API design principles
- Use semantic HTML and accessible UI patterns
- Implement responsive design with CSS Grid/Flexbox

### File Structure
```
├── server/                 # Backend Node.js application
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   └── index.js           # Server entry point
├── client/                # React frontend
│   └── src/components/    # React components
├── alexa-skill/           # Alexa configuration files
└── README.md             # Complete documentation
```

### API Patterns
- All endpoints return JSON responses
- Use appropriate HTTP status codes
- Implement input validation and sanitization
- Include error messages in response body
- Use async/await for database operations

### Component Guidelines
- Use functional components with hooks
- Implement proper state management
- Include loading and error states
- Use CSS-in-JS with styled-jsx for styling
- Make components responsive and accessible

### Security Considerations
- Store sensitive data in environment variables
- Validate all user inputs
- Use CORS appropriately
- Implement rate limiting for production
- Sanitize database queries

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- MongoDB (local or Atlas)
- OpenAI API key
- Amazon Developer account (for Alexa)

### Installation Process
1. Install dependencies: `npm run install:all`
2. Configure environment variables in `server/.env`
3. Start development: `npm run dev`
4. Configure Alexa Skill using provided JSON files

### Environment Variables
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/alexa-calendar
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
ALEXA_SKILL_ID=your_skill_id
```

## Troubleshooting

### Common Issues
- **Node.js Permissions**: Reinstall Node.js with proper permissions or use nvm
- **MongoDB Connection**: Ensure MongoDB is running locally or check Atlas connection string
- **OpenAI API**: Verify API key and check rate limits
- **CORS Issues**: Update frontend proxy configuration

### Development Notes
- Frontend runs on port 3000, backend on port 3001
- MongoDB collections: tasks, rewards
- Alexa endpoint: `/api/alexa`
- ChatGPT endpoint: `/api/chatgpt/ask`

Project completed successfully with all features implemented!