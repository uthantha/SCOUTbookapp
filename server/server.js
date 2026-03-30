const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const passport = require('./config/passport');
const User = require('./models/User');
const PasswordReset = require('./models/PasswordReset');
const Profile = require('./models/Profile');
const Video = require('./models/Video');
const Opportunity = require('./models/Opportunity');
const Tournament = require('./models/Tournament');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const opportunitiesRoutes = require('./routes/opportunities');
const tournamentsRoutes = require('./routes/tournaments');
const adminRoutes = require('./routes/admin');
const messagesRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messagesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'ScoutBook API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Create tables if they don't exist
    console.log('🔄 Initializing database tables...');
    await User.createTable();
    await PasswordReset.createTable();
    await Profile.createTable();
    await Opportunity.createTable();
    await Tournament.createTable();
    await Video.createTable();
    await Conversation.createTable();
    await Message.createTable();
    console.log('✅ All database tables initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️  Connected to PostgreSQL database: ${process.env.DB_NAME}`);
      console.log(`📱 Frontend should be running on: http://localhost:3000`);
      console.log(`\n🎯 ScoutBook - Sports Talent Discovery Platform`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Make sure PostgreSQL is running and database credentials are correct');
    process.exit(1);
  }
};

startServer();