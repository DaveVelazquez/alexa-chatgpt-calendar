const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const alexaRoutes = require('./routes/alexa');
const chatgptRoutes = require('./routes/chatgpt');
const calendarRoutes = require('./routes/calendar');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection (with error handling)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alexa-calendar', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('⚠️  MongoDB not available, continuing without database...');
    console.log('   Install MongoDB or use MongoDB Atlas for full functionality');
  }
};

connectDB();

// Routes
app.use('/api/alexa', alexaRoutes);
app.use('/api/chatgpt', chatgptRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;