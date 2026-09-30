const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const { sendSuccess } = require('./utils/response');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const opportunityRoutes = require('./routes/opportunityRoutes');
const trackerRoutes = require('./routes/trackerRoutes');
const aiRoutes = require('./routes/aiRoutes');
const exportRoutes = require('./routes/exportRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Middleware
app.use(helmet());

// Restrict CORS to specific origins in production
const corsOptions = {
  origin: env.NODE_ENV === 'production' ? (env.CLIENT_URL || 'https://your-production-url.com') : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-payment-signature']
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window`
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, 
  legacyHeaders: false, 
});
// Apply the rate limiting middleware to all requests except in test environment
if (env.NODE_ENV !== 'test') {
  app.use(limiter);
}

app.use(express.json({ limit: '1mb' })); // Reduced from 5mb to 1mb for security against large payloads
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static React client build if compiled
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CareerAlign Full-Stack Platform',
    version: '1.0.0',
    storageMode: env.SUPABASE_URL ? 'supabase-connected' : 'local-resilient-mode',
    aiStatus: env.GEMINI_API_KEY ? 'gemini-enabled' : 'grounded-heuristic-mode'
  });
});

// API Routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/my-opportunities', trackerRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', exportRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Catch-all route to serve React app index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
